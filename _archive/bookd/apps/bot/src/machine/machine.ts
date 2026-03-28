import { assign, setup } from "xstate";

import type { BookingContext } from "./context";
import { initialContext } from "./context";
import type { BookingEvent } from "./events";

export const bookingMachine = setup({
  types: {
    context: {} as BookingContext,
    events: {} as BookingEvent,
    input: {} as Partial<BookingContext> | undefined,
  },
  guards: {
    isReturningCustomer: ({ context }) => {
      return context.lastServiceId !== null && context.lastStylistId !== null;
    },
    isNewCustomer: ({ context }) => {
      return context.clientName === null;
    },
  },
}).createMachine({
  id: "booking",
  initial: "idle",
  context: ({ input }) => ({ ...initialContext, ...input }),
  states: {
    idle: {
      on: {
        MESSAGE_RECEIVED: [
          {
            target: "onboarding",
            guard: "isNewCustomer",
            actions: assign({
              messageCount: ({ context }) => context.messageCount + 1,
            }),
          },
          {
            target: "returningGreeting",
            guard: "isReturningCustomer",
            actions: assign({
              messageCount: ({ context }) => context.messageCount + 1,
            }),
          },
          {
            target: "serviceSelection",
            actions: assign({
              messageCount: ({ context }) => context.messageCount + 1,
            }),
          },
        ],
        REQUEST_RESCHEDULE: "rescheduling",
        REQUEST_CANCEL: "cancellation",
      },
    },

    onboarding: {
      on: {
        NAME_PROVIDED: {
          target: "serviceSelection",
          actions: assign({
            clientName: ({ event }) => event.name,
          }),
        },
      },
    },

    returningGreeting: {
      on: {
        SAME_AS_LAST_TIME: {
          target: "dateTimeSelection",
          actions: assign({
            selectedServiceId: ({ context }) => context.lastServiceId,
            selectedServiceName: ({ context }) => context.lastServiceName,
            selectedStylistId: ({ context }) => context.lastStylistId,
            selectedStylistName: ({ context }) => context.lastStylistName,
          }),
        },
        SOMETHING_DIFFERENT: "serviceSelection",
      },
    },

    serviceSelection: {
      on: {
        SERVICE_SELECTED: {
          target: "stylistSelection",
          actions: assign({
            selectedServiceId: ({ event }) => event.serviceId,
            selectedServiceName: ({ event }) => event.serviceName,
          }),
        },
      },
    },

    stylistSelection: {
      on: {
        STYLIST_SELECTED: {
          target: "dateTimeSelection",
          actions: assign({
            selectedStylistId: ({ event }) => event.stylistId,
            selectedStylistName: ({ event }) => event.stylistName,
          }),
        },
        ANY_STYLIST: {
          target: "dateTimeSelection",
          actions: assign({
            selectedStylistId: () => "any",
            selectedStylistName: () => "Any available",
          }),
        },
      },
    },

    dateTimeSelection: {
      on: {
        DATETIME_SELECTED: {
          target: "confirmation",
          actions: assign({
            selectedDate: ({ event }) => event.date,
            selectedTime: ({ event }) => event.time,
          }),
        },
      },
    },

    confirmation: {
      on: {
        CONFIRM_BOOKING: "booked",
        CHANGE_BOOKING: {
          target: "serviceSelection",
          actions: assign({
            selectedServiceId: () => null,
            selectedServiceName: () => null,
            selectedStylistId: () => null,
            selectedStylistName: () => null,
            selectedDate: () => null,
            selectedTime: () => null,
          }),
        },
      },
    },

    booked: {
      entry: assign({
        lastServiceId: ({ context }) => context.selectedServiceId,
        lastStylistId: ({ context }) => context.selectedStylistId,
        lastServiceName: ({ context }) => context.selectedServiceName,
        lastStylistName: ({ context }) => context.selectedStylistName,
      }),
      on: {
        REQUEST_RESCHEDULE: "rescheduling",
        REQUEST_CANCEL: "cancellation",
        BOOKING_COMPLETED: {
          target: "idle",
          actions: assign({
            selectedServiceId: () => null,
            selectedServiceName: () => null,
            selectedStylistId: () => null,
            selectedStylistName: () => null,
            selectedDate: () => null,
            selectedTime: () => null,
            currentBookingId: () => null,
            currentBookingDetails: () => null,
          }),
        },
      },
    },

    rescheduling: {
      on: {
        DATETIME_SELECTED: {
          target: "booked",
          actions: assign({
            selectedDate: ({ event }) => event.date,
            selectedTime: ({ event }) => event.time,
          }),
        },
      },
    },

    cancellation: {
      on: {
        CONFIRM_CANCEL: {
          target: "idle",
          actions: assign({
            selectedServiceId: () => null,
            selectedServiceName: () => null,
            selectedStylistId: () => null,
            selectedStylistName: () => null,
            selectedDate: () => null,
            selectedTime: () => null,
            currentBookingId: () => null,
            currentBookingDetails: () => null,
          }),
        },
        KEEP_BOOKING: "booked",
      },
    },
  },
});
