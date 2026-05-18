export interface Amenity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  pricePerSlot?: number; // Amount due for booking
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "10:00"
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Booking {
  id?: string;
  amenityId: string;
  tenantId: string;
  tenantName: string;
  amenityName?: string; // Added for admin view
  date: string; // ISO date format YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  attachmentUrl?: string;
  attachmentFile?: File; // For form submission
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFormData {
  amenity: Amenity;
  selectedDate: string;
  timeSlot: TimeSlot;
}

export interface BookingFormData {
  amenity: Amenity;
  selectedDate: string;
  timeSlot: TimeSlot;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  status: 'available' | 'partially-booked' | 'fully-booked'; // For color coding
}

export interface TimeSlotWithBooking extends TimeSlot {
  isBooked: boolean;
  booking?: Booking;
}
