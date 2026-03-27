import type { SnapshotFrom } from "xstate";
import { createActor } from "xstate";

import type { BookingContext } from "../machine/context";
import type { BookingEvent } from "../machine/events";
import { bookingMachine } from "../machine/machine";
import type { SupabaseClient } from "../services/supabase";
import type { IncomingMessage, WebhookPayload } from "../types";
import type { OutgoingMessage, WhatsAppSender } from "../whatsapp/sender";

interface HandleMessageDeps {
  db: SupabaseClient;
  wa: WhatsAppSender;
  salonId: string;
}

export async function handleMessage(
  payload: WebhookPayload,
  deps: HandleMessageDeps
): Promise<void> {
  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (!value?.messages?.length) return;

  const message = value.messages[0];
  const contactName = value.contacts?.[0]?.profile?.name ?? undefined;
  const from = message.from;

  // Get or create client
  let client = await deps.db.getClientByPhone(from);
  if (!client) {
    client = await deps.db.upsertClient({
      phone: from,
      name: contactName,
      salon_id: deps.salonId,
    });
  }

  const clientId = client!.id as string;

  // Log inbound message
  await deps.db.logMessage({
    whatsapp_message_id: message.id,
    salon_id: deps.salonId,
    client_id: clientId,
    direction: "inbound",
    message_type: message.type === "interactive" ? "interactive" : "text",
    content: message,
  });

  // Rehydrate state machine
  const snapshot = client!.state_snapshot as SnapshotFrom<typeof bookingMachine> | null;
  const actor = createActor(bookingMachine, {
    snapshot: snapshot ?? undefined,
    input: undefined,
  });

  // If no previous state, initialize context
  if (!snapshot) {
    // Fresh machine with client context
    const freshActor = createActor(
      bookingMachine.provide({
        // Override initial context with client-specific data
      }),
      {
        input: undefined,
      }
    );
    freshActor.start();

    // Set client-specific context
    const ctx = freshActor.getSnapshot().context;
    ctx.clientPhone = from;
    ctx.clientName = (client!.name as string) ?? contactName;
    ctx.salonId = deps.salonId;

    // Check for previous bookings to populate lastService/lastStylist
    const lastBooking = await deps.db.getActiveBooking(clientId);
    if (lastBooking) {
      ctx.lastServiceId = lastBooking.service_id as string;
      ctx.lastStylistId = lastBooking.stylist_id as string;
    }

    const event = parseEvent(message);
    freshActor.send(event);

    const newSnapshot = freshActor.getSnapshot();
    const messages = await buildResponseMessages(
      from,
      newSnapshot.value as string,
      newSnapshot.context,
      deps
    );
    for (const msg of messages) {
      await deps.wa.send(msg);
    }

    await deps.db.updateClientState(from, freshActor.getPersistedSnapshot());
    freshActor.stop();
    return;
  }

  actor.start();
  const event = parseEvent(message);
  const prevState = actor.getSnapshot().value;
  actor.send(event);
  const newSnapshot = actor.getSnapshot();
  const newState = newSnapshot.value as string;

  // Handle booking creation when entering "booked" state
  if (prevState !== "booked" && newState === "booked") {
    const ctx = newSnapshot.context;
    if (ctx.selectedServiceId && ctx.selectedStylistId && ctx.selectedDate && ctx.selectedTime) {
      const services = await deps.db.getServices(deps.salonId);
      const service = services.find((s) => s.id === ctx.selectedServiceId);
      const durationMinutes = (service?.duration_minutes as number) ?? 60;
      const startsAt = new Date(`${ctx.selectedDate}T${ctx.selectedTime}:00`);
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

      let stylistId = ctx.selectedStylistId;
      if (stylistId === "any") {
        const stylists = await deps.db.getStylists(deps.salonId, ctx.selectedServiceId);
        stylistId = (stylists[0]?.id as string) ?? stylistId;
      }

      const booking = await deps.db.createBooking({
        salon_id: deps.salonId,
        client_id: clientId,
        stylist_id: stylistId,
        service_id: ctx.selectedServiceId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      });

      newSnapshot.context.currentBookingId = booking?.id as string;
    }
  }

  // Handle cancellation
  if (newState === "idle" && prevState === "cancellation") {
    const ctx = newSnapshot.context;
    if (ctx.currentBookingId) {
      await deps.db.updateBooking(ctx.currentBookingId, {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      });
    }
  }

  const messages = await buildResponseMessages(
    from,
    newState,
    newSnapshot.context,
    deps
  );
  for (const msg of messages) {
    await deps.wa.send(msg);
  }

  await deps.db.updateClientState(from, actor.getPersistedSnapshot());
  actor.stop();
}

function parseEvent(message: IncomingMessage): BookingEvent {
  // Handle interactive replies (button or list)
  if (message.type === "interactive" && message.interactive) {
    const reply =
      message.interactive.button_reply ?? message.interactive.list_reply;
    if (reply) {
      const id = reply.id;
      const title = reply.title;

      if (id === "confirm_booking") return { type: "CONFIRM_BOOKING" };
      if (id === "change_booking") return { type: "CHANGE_BOOKING" };
      if (id === "same_as_last") return { type: "SAME_AS_LAST_TIME" };
      if (id === "something_different") return { type: "SOMETHING_DIFFERENT" };
      if (id === "any_stylist") return { type: "ANY_STYLIST" };
      if (id === "confirm_cancel") return { type: "CONFIRM_CANCEL" };
      if (id === "keep_booking") return { type: "KEEP_BOOKING" };
      if (id === "request_reschedule") return { type: "REQUEST_RESCHEDULE" };
      if (id === "request_cancel") return { type: "REQUEST_CANCEL" };

      if (id.startsWith("service_")) {
        return {
          type: "SERVICE_SELECTED",
          serviceId: id.replace("service_", ""),
          serviceName: title,
        };
      }
      if (id.startsWith("stylist_")) {
        return {
          type: "STYLIST_SELECTED",
          stylistId: id.replace("stylist_", ""),
          stylistName: title,
        };
      }
      if (id.startsWith("datetime_")) {
        const [date, time] = id.replace("datetime_", "").split("_");
        return { type: "DATETIME_SELECTED", date, time };
      }
    }
  }

  // Handle text messages
  const text = message.text?.body?.trim().toLowerCase() ?? "";

  if (text.includes("reschedule") || text.includes("move")) {
    return { type: "REQUEST_RESCHEDULE" };
  }
  if (text.includes("cancel")) {
    return { type: "REQUEST_CANCEL" };
  }

  // Default: treat as generic message or name
  if (text.length > 0 && text.length <= 50 && !text.includes(" book")) {
    return { type: "NAME_PROVIDED", name: message.text?.body?.trim() ?? text };
  }

  return { type: "MESSAGE_RECEIVED", text };
}

async function buildResponseMessages(
  to: string,
  state: string,
  context: BookingContext,
  deps: HandleMessageDeps
): Promise<OutgoingMessage[]> {
  switch (state) {
    case "onboarding":
      return [
        {
          type: "text",
          to,
          text: "Hey! Welcome! I can help you book an appointment. What's your name?",
        },
      ];

    case "returningGreeting":
      return [
        {
          type: "buttons",
          to,
          text: `Welcome back${context.clientName ? `, ${context.clientName}` : ""}! Last time you had ${context.lastServiceName ?? "a service"} with ${context.lastStylistName ?? "us"}.\nWant to book the same?`,
          buttons: [
            { id: "same_as_last", title: "Same as last time" },
            { id: "something_different", title: "Something different" },
          ],
        },
      ];

    case "serviceSelection": {
      const services = await deps.db.getServices(deps.salonId);
      const rows = services.map((s) => ({
        id: `service_${s.id}`,
        title: (s.name as string).slice(0, 24),
        description: `${s.duration_minutes} min - ${s.price_currency} ${s.price_amount}`,
      }));
      return [
        {
          type: "list",
          to,
          text: `${context.clientName ? `Great, ${context.clientName}! ` : ""}What service are you looking for?`,
          buttonText: "View Services",
          sections: [{ title: "Services", rows }],
        },
      ];
    }

    case "stylistSelection": {
      const stylists = await deps.db.getStylists(
        deps.salonId,
        context.selectedServiceId ?? undefined
      );
      const rows = [
        { id: "any_stylist", title: "Any available" },
        ...stylists.map((s) => ({
          id: `stylist_${s.id}`,
          title: (s.name as string).slice(0, 24),
        })),
      ];
      return [
        {
          type: "list",
          to,
          text: `Got it, ${context.selectedServiceName}! Do you have a preferred stylist?`,
          buttonText: "Choose Stylist",
          sections: [{ title: "Stylists", rows }],
        },
      ];
    }

    case "dateTimeSelection":
      return [
        {
          type: "text",
          to,
          text: "When works for you? Please send a date and time, e.g. \"Thursday 3pm\" or \"2026-03-28 15:00\".",
        },
      ];

    case "confirmation":
      return [
        {
          type: "buttons",
          to,
          text: `Here's your booking:\n\n${context.selectedServiceName}\n${context.selectedDate} at ${context.selectedTime}\nStylist: ${context.selectedStylistName}\n\nShall I confirm?`,
          buttons: [
            { id: "confirm_booking", title: "Confirm" },
            { id: "change_booking", title: "Change" },
          ],
        },
      ];

    case "booked":
      return [
        {
          type: "buttons",
          to,
          text: "You're all set! I'll send you a reminder the day before.\nTo reschedule or cancel, just message me anytime.",
          buttons: [
            { id: "request_reschedule", title: "Reschedule" },
            { id: "request_cancel", title: "Cancel" },
          ],
        },
      ];

    case "rescheduling":
      return [
        {
          type: "text",
          to,
          text: `You have ${context.selectedServiceName} booked for ${context.selectedDate} at ${context.selectedTime}.\nWhen would you like to move it to? Send a new date and time.`,
        },
      ];

    case "cancellation":
      return [
        {
          type: "buttons",
          to,
          text: `You have ${context.selectedServiceName} booked for ${context.selectedDate} at ${context.selectedTime}.\nAre you sure you want to cancel?`,
          buttons: [
            { id: "confirm_cancel", title: "Yes, cancel" },
            { id: "keep_booking", title: "Keep it" },
          ],
        },
      ];

    default:
      return [];
  }
}
