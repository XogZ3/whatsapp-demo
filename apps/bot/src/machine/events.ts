export type BookingEvent =
  | { type: "MESSAGE_RECEIVED"; text: string }
  | { type: "NAME_PROVIDED"; name: string }
  | { type: "SERVICE_SELECTED"; serviceId: string; serviceName: string }
  | { type: "SAME_AS_LAST_TIME" }
  | { type: "SOMETHING_DIFFERENT" }
  | { type: "STYLIST_SELECTED"; stylistId: string; stylistName: string }
  | { type: "ANY_STYLIST" }
  | { type: "DATETIME_SELECTED"; date: string; time: string }
  | { type: "CONFIRM_BOOKING" }
  | { type: "CHANGE_BOOKING" }
  | { type: "REQUEST_RESCHEDULE" }
  | { type: "REQUEST_CANCEL" }
  | { type: "CONFIRM_CANCEL" }
  | { type: "KEEP_BOOKING" }
  | { type: "BOOKING_COMPLETED" };
