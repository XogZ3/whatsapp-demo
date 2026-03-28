import { describe, expect, it } from "vitest";
import { createActor } from "xstate";

import type { BookingContext } from "./context";
import { bookingMachine } from "./machine";

function createTestActor(input?: Partial<BookingContext>) {
  const actor = createActor(bookingMachine, { input });
  actor.start();
  return actor;
}

describe("bookingMachine", () => {
  it("starts in idle state", () => {
    const actor = createTestActor();
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("transitions idle -> onboarding for new customer", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    expect(actor.getSnapshot().value).toBe("onboarding");
    actor.stop();
  });

  it("transitions onboarding -> serviceSelection when name provided", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Sarah" });
    expect(actor.getSnapshot().value).toBe("serviceSelection");
    expect(actor.getSnapshot().context.clientName).toBe("Sarah");
    actor.stop();
  });

  it("transitions idle -> returningGreeting for returning customer", () => {
    const actor = createTestActor({
      clientName: "Ahmed",
      lastServiceId: "svc-1",
      lastStylistId: "sty-1",
      lastServiceName: "Haircut",
      lastStylistName: "Noor",
    });
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    expect(actor.getSnapshot().value).toBe("returningGreeting");
    actor.stop();
  });

  it("returning customer can rebook same as last time", () => {
    const actor = createTestActor({
      clientName: "Ahmed",
      lastServiceId: "svc-1",
      lastStylistId: "sty-1",
      lastServiceName: "Haircut",
      lastStylistName: "Noor",
    });
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "SAME_AS_LAST_TIME" });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe("dateTimeSelection");
    expect(ctx.selectedServiceId).toBe("svc-1");
    expect(ctx.selectedStylistId).toBe("sty-1");
    actor.stop();
  });

  it("full new booking flow: service -> stylist -> datetime -> confirm -> booked", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    expect(actor.getSnapshot().value).toBe("onboarding");

    actor.send({ type: "NAME_PROVIDED", name: "Marco" });
    expect(actor.getSnapshot().value).toBe("serviceSelection");

    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Haircut",
    });
    expect(actor.getSnapshot().value).toBe("stylistSelection");

    actor.send({
      type: "STYLIST_SELECTED",
      stylistId: "sty-1",
      stylistName: "Noor",
    });
    expect(actor.getSnapshot().value).toBe("dateTimeSelection");

    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-28",
      time: "15:00",
    });
    expect(actor.getSnapshot().value).toBe("confirmation");

    actor.send({ type: "CONFIRM_BOOKING" });
    expect(actor.getSnapshot().value).toBe("booked");

    const ctx = actor.getSnapshot().context;
    expect(ctx.lastServiceId).toBe("svc-1");
    expect(ctx.lastStylistId).toBe("sty-1");
    actor.stop();
  });

  it("can change booking at confirmation", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Sara" });
    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Haircut",
    });
    actor.send({ type: "ANY_STYLIST" });
    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-28",
      time: "15:00",
    });
    expect(actor.getSnapshot().value).toBe("confirmation");

    actor.send({ type: "CHANGE_BOOKING" });
    expect(actor.getSnapshot().value).toBe("serviceSelection");
    const ctx = actor.getSnapshot().context;
    expect(ctx.selectedServiceId).toBeNull();
    expect(ctx.selectedStylistId).toBeNull();
    actor.stop();
  });

  it("rescheduling flow", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Ali" });
    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Haircut",
    });
    actor.send({ type: "ANY_STYLIST" });
    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-28",
      time: "15:00",
    });
    actor.send({ type: "CONFIRM_BOOKING" });
    expect(actor.getSnapshot().value).toBe("booked");

    actor.send({ type: "REQUEST_RESCHEDULE" });
    expect(actor.getSnapshot().value).toBe("rescheduling");

    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-29",
      time: "14:00",
    });
    expect(actor.getSnapshot().value).toBe("booked");
    expect(actor.getSnapshot().context.selectedDate).toBe("2026-03-29");
    actor.stop();
  });

  it("cancellation flow - confirm cancel", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Lena" });
    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Color",
    });
    actor.send({ type: "ANY_STYLIST" });
    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-28",
      time: "10:00",
    });
    actor.send({ type: "CONFIRM_BOOKING" });
    expect(actor.getSnapshot().value).toBe("booked");

    actor.send({ type: "REQUEST_CANCEL" });
    expect(actor.getSnapshot().value).toBe("cancellation");

    actor.send({ type: "CONFIRM_CANCEL" });
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("cancellation flow - keep booking", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Lena" });
    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Color",
    });
    actor.send({ type: "ANY_STYLIST" });
    actor.send({
      type: "DATETIME_SELECTED",
      date: "2026-03-28",
      time: "10:00",
    });
    actor.send({ type: "CONFIRM_BOOKING" });
    actor.send({ type: "REQUEST_CANCEL" });
    expect(actor.getSnapshot().value).toBe("cancellation");

    actor.send({ type: "KEEP_BOOKING" });
    expect(actor.getSnapshot().value).toBe("booked");
    actor.stop();
  });

  it("increments messageCount on MESSAGE_RECEIVED", () => {
    const actor = createTestActor();
    expect(actor.getSnapshot().context.messageCount).toBe(0);
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    expect(actor.getSnapshot().context.messageCount).toBe(1);
    actor.stop();
  });

  it("any stylist sets stylist to 'any'", () => {
    const actor = createTestActor();
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    actor.send({ type: "NAME_PROVIDED", name: "Test" });
    actor.send({
      type: "SERVICE_SELECTED",
      serviceId: "svc-1",
      serviceName: "Nails",
    });
    actor.send({ type: "ANY_STYLIST" });
    expect(actor.getSnapshot().context.selectedStylistId).toBe("any");
    expect(actor.getSnapshot().context.selectedStylistName).toBe(
      "Any available"
    );
    actor.stop();
  });

  it("known customer without previous bookings goes to serviceSelection", () => {
    const actor = createTestActor({ clientName: "Known User" });
    actor.send({ type: "MESSAGE_RECEIVED", text: "Hi" });
    expect(actor.getSnapshot().value).toBe("serviceSelection");
    actor.stop();
  });
});
