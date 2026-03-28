export interface BookingContext {
  clientPhone: string;
  clientName: string | null;
  salonId: string;
  locale: "en" | "ar" | "de";
  selectedServiceId: string | null;
  selectedServiceName: string | null;
  selectedStylistId: string | null;
  selectedStylistName: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  currentBookingId: string | null;
  currentBookingDetails: string | null;
  lastServiceId: string | null;
  lastStylistId: string | null;
  lastServiceName: string | null;
  lastStylistName: string | null;
  messageCount: number;
}

export const initialContext: BookingContext = {
  clientPhone: "",
  clientName: null,
  salonId: "",
  locale: "en",
  selectedServiceId: null,
  selectedServiceName: null,
  selectedStylistId: null,
  selectedStylistName: null,
  selectedDate: null,
  selectedTime: null,
  currentBookingId: null,
  currentBookingDetails: null,
  lastServiceId: null,
  lastStylistId: null,
  lastServiceName: null,
  lastStylistName: null,
  messageCount: 0,
};
