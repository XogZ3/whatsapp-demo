import type { SupabaseClient } from "../services/supabase";
import type { WhatsAppSender } from "../whatsapp/sender";

interface ReminderDeps {
  db: SupabaseClient;
  wa: WhatsAppSender;
}

export async function processReminders(deps: ReminderDeps): Promise<void> {
  await process48hReminders(deps);
  await process2hReminders(deps);
}

async function process48hReminders(deps: ReminderDeps): Promise<void> {
  const bookings = await deps.db.getPendingReminders48h();

  for (const booking of bookings) {
    const client = booking.wa_clients as Record<string, unknown>;
    const service = booking.wa_services as Record<string, unknown>;
    const salon = booking.wa_salons as Record<string, unknown>;
    const phone = client?.phone as string;
    const startsAt = new Date(booking.starts_at as string);

    const dateStr = startsAt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timeStr = startsAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    await deps.wa.send({
      type: "buttons",
      to: phone,
      text: `Reminder: You have ${service?.name ?? "an appointment"} at ${salon?.name ?? "the salon"} on ${dateStr} at ${timeStr}.`,
      buttons: [
        { id: "confirm_booking", title: "Confirm" },
        { id: "request_reschedule", title: "Reschedule" },
        { id: "request_cancel", title: "Cancel" },
      ],
    });

    await deps.db.updateBooking(booking.id as string, {
      reminder_48h_sent: true,
    });
  }
}

async function process2hReminders(deps: ReminderDeps): Promise<void> {
  const bookings = await deps.db.getPendingReminders2h();

  for (const booking of bookings) {
    const client = booking.wa_clients as Record<string, unknown>;
    const salon = booking.wa_salons as Record<string, unknown>;
    const phone = client?.phone as string;

    const hasLocation =
      salon?.latitude !== null && salon?.longitude !== null;

    if (hasLocation) {
      await deps.wa.send({
        type: "location",
        to: phone,
        latitude: salon!.latitude as number,
        longitude: salon!.longitude as number,
        name: salon!.name as string,
        address: (salon!.address as string) ?? "",
      });
    }

    await deps.wa.send({
      type: "text",
      to: phone,
      text: `See you in 2 hours! ${salon?.name ?? ""}${salon?.address ? `, ${salon.address}` : ""}`,
    });

    await deps.db.updateBooking(booking.id as string, {
      reminder_2h_sent: true,
    });
  }
}
