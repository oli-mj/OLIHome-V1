import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, switchMap, delay } from 'rxjs/operators';
import { ApiService } from './api/api.service';
import {
  Amenity,
  Booking,
  TimeSlot,
  DayAvailability,
  TimeSlotWithBooking,
} from '../models/amenity.model';

@Injectable({
  providedIn: 'root',
})
export class AmenityBookingService {
  private apiService = inject(ApiService);

  // Default time slots: 6 AM to 10 PM in 2-hour intervals
  private defaultTimeSlots: TimeSlot[] = [
    { id: '1', startTime: '06:00', endTime: '08:00' },
    { id: '2', startTime: '08:00', endTime: '10:00' },
    { id: '3', startTime: '10:00', endTime: '12:00' },
    { id: '4', startTime: '12:00', endTime: '14:00' },
    { id: '5', startTime: '14:00', endTime: '16:00' },
    { id: '6', startTime: '16:00', endTime: '18:00' },
    { id: '7', startTime: '18:00', endTime: '20:00' },
    { id: '8', startTime: '20:00', endTime: '22:00' },
  ];

  private bookingsRefresh$ = new BehaviorSubject<void>(undefined);

  // --- MOCK DATA SOURCE ---
  private mockAmenities: Amenity[] = [
    {
      id: 'amenity-1',
      name: 'Swimming Pool',
      description: 'Olympic-sized community swimming pool',
      location: 'Recreation Center',
      pricePerSlot: 10,
    },
    {
      id: 'amenity-2',
      name: 'Club House',
      description: 'Spacious club house for events and parties',
      location: 'Building A',
      pricePerSlot: 50,
    },
    {
      id: 'amenity-3',
      name: 'Basketball Court',
      description: 'Full-sized indoor basketball court',
      location: 'Sports Complex',
      pricePerSlot: 0,
    }
  ];
  private mockBookings: Booking[] = [
    {
      id: 'mock-1',
      amenityId: 'amenity-1',
      tenantId: 'tenant-user-1',
      tenantName: 'John Doe',
      amenityName: 'Community Center',
      date: new Date().toISOString().split('T')[0], // Today
      startTime: '08:00',
      endTime: '10:00',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      amenityId: 'amenity-1',
      tenantId: 'tenant-user-2',
      tenantName: 'Jane Smith',
      amenityName: 'Community Center',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      startTime: '10:00',
      endTime: '12:00',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
  ];

  constructor() {}

  /**
   * Get available time slots for a specific amenity and date
   */
  getTimeSlotsForDate(
    amenityId: string,
    date: string
  ): Observable<Booking[]> {
    return this.bookingsRefresh$.pipe(
      switchMap(() => {
        const bookings = this.mockBookings.filter(b => b.amenityId === amenityId && b.date === date);
        return of(bookings).pipe(delay(300));
      })
    );
  }

  /**
   * Get bookings for a specific amenity within a date range
   */
  getBookingsByAmenityAndDateRange(
    amenityId: string,
    startDate: string,
    endDate: string
  ): Observable<Booking[]> {
    return this.bookingsRefresh$.pipe(
      switchMap(() => {
        const bookings = this.mockBookings.filter(b => 
          b.amenityId === amenityId && 
          b.date >= startDate && 
          b.date <= endDate
        );
        return of(bookings).pipe(delay(300));
      })
    );
  }

  /**
   * Get all bookings for a specific amenity on a specific date
   */
  getBookingsByAmenityAndDate(
    amenityId: string,
    date: string
  ): Observable<Booking[]> {
    const bookings = this.mockBookings.filter(b => b.amenityId === amenityId && b.date === date);
    return of(bookings).pipe(delay(300));
  }

  /**
   * Get time slots with booking information for a date
   */
  getTimeSlotsWithBookings(
    amenityId: string,
    date: string
  ): Observable<TimeSlotWithBooking[]> {
    return this.getBookingsByAmenityAndDate(amenityId, date).pipe(
      map((bookings) => {
        return this.defaultTimeSlots.map((slot) => {
          // Match booking by amenityId, date, and time range
          const booking = bookings.find(
            (b) =>
              b.startTime === slot.startTime &&
              b.endTime === slot.endTime &&
              b.status !== 'REJECTED'
          );
          return {
            ...slot,
            isBooked: !!booking,
            booking,
          };
        });
      })
    );
  }

  /**
   * Calculate availability for each day in a month
   */
  getMonthAvailability(
    amenityId: string,
    year: number,
    month: number
  ): Observable<{ [key: string]: DayAvailability }> {
    // Get first and last day of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return this.getBookingsByAmenityAndDateRange(
      amenityId,
      startDate,
      endDate
    ).pipe(
      map((bookings) => {
        const availability: { [key: string]: DayAvailability } = {};

        // Initialize all days in the month
        for (let day = 1; day <= lastDay; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          // Only count APPROVED bookings as booked slots
          const dayBookings = bookings.filter(
            (b) => b.date === dateStr && b.status === 'APPROVED'
          );

          const bookedSlots = dayBookings.length;
          const totalSlots = this.defaultTimeSlots.length;
          const availableSlots = totalSlots - bookedSlots;

          let status: 'available' | 'partially-booked' | 'fully-booked' =
            'available';
          if (bookedSlots === 0) {
            status = 'available';
          } else if (bookedSlots < totalSlots) {
            status = 'partially-booked';
          } else {
            status = 'fully-booked';
          }

          availability[dateStr] = {
            date: dateStr,
            totalSlots,
            availableSlots,
            bookedSlots,
            status,
          };
        }

        return availability;
      })
    );
  }

  /**
   * Create a new booking
   */
  createBooking(booking: Omit<Booking, 'id'>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: 'mock-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    this.mockBookings.push(newBooking);
    
    return of(newBooking).pipe(
      delay(500),
      tap(() => this.refreshBookings())
    );
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string): Observable<Booking> {
    const idx = this.mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      this.mockBookings[idx].status = 'REJECTED';
      return of(this.mockBookings[idx]).pipe(
        delay(500),
        tap(() => this.refreshBookings())
      );
    }
    return throwError(() => new Error('Booking not found'));
  }

  /**
   * Trigger a refresh of all bookings (for BehaviorSubject)
   */
  refreshBookings(): void {
    this.bookingsRefresh$.next(undefined);
  }

  /**
   * Get the default time slots configuration
   */
  getDefaultTimeSlots(): TimeSlot[] {
    return [...this.defaultTimeSlots];
  }

  /**
   * Set custom time slots (e.g., for different amenities)
   */
  setCustomTimeSlots(slots: TimeSlot[]): void {
    this.defaultTimeSlots = slots;
  }

  /**
   * Format time slot as display string (e.g., "8:00 AM – 10:00 AM")
   */
  formatTimeSlot(slot: TimeSlot): string {
    return `${this.formatTime(slot.startTime)} – ${this.formatTime(slot.endTime)}`;
  }

  /**
   * Convert 24-hour time to 12-hour format with AM/PM
   */
  private formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
  }

  /**
   * Create booking with file attachment
   */
  createBookingWithAttachment(
    booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Booking> {
    // Mock the file attachment implementation
    const newBooking: Booking = {
      ...booking,
      id: 'mock-' + Math.random().toString(36).substring(2, 9),
      attachmentUrl: booking.attachmentFile ? URL.createObjectURL(booking.attachmentFile) : undefined,
      createdAt: new Date().toISOString()
    };
    this.mockBookings.push(newBooking);
    
    return of(newBooking).pipe(
      delay(800),
      tap(() => this.refreshBookings())
    );
  }

  /**
   * Get all bookings for a specific tenant
   */
  getTenantBookings(tenantId: string): Observable<Booking[]> {
    return this.bookingsRefresh$.pipe(
      switchMap(() => {
        const bookings = this.mockBookings.filter(b => b.tenantId === tenantId);
        return of(bookings).pipe(delay(300));
      })
    );
  }

  /**
   * Get the bookings refresh subject (for external subscription)
   */
  getBookingsRefresh$(): Observable<void> {
    return this.bookingsRefresh$.asObservable();
  }

  /**
   * Get all pending bookings for admin verification
   */
  getPendingBookings(): Observable<Booking[]> {
    const bookings = this.mockBookings.filter(b => b.status === 'PENDING');
    return of(bookings).pipe(delay(300));
  }

  /**
   * Get all bookings with optional status filter for admin
   */
  getAllBookings(status?: string): Observable<Booking[]> {
    let bookings = this.mockBookings;
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    return of(bookings).pipe(delay(300));
  }

  /**
   * Update booking status (approve or reject)
   */
  updateBookingStatus(bookingId: string, status: 'APPROVED' | 'REJECTED'): Observable<Booking> {
    const idx = this.mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      this.mockBookings[idx].status = status;
      this.mockBookings[idx].updatedAt = new Date().toISOString();
      return of(this.mockBookings[idx]).pipe(
        delay(500),
        tap(() => this.refreshBookings())
      );
    }
    return throwError(() => new Error('Booking not found'));
  }

  /**
   * Get list of all available amenities
   */
  getAmenities(): Observable<Amenity[]> {
    return of(this.mockAmenities).pipe(delay(300));
  }
  /**
   * Upload payment proof for an existing booking
   */
  uploadPayment(bookingId: string, file: File): Observable<Booking> {
    const idx = this.mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      // Create a local object URL for the mock file upload
      this.mockBookings[idx].attachmentUrl = URL.createObjectURL(file);
      this.mockBookings[idx].updatedAt = new Date().toISOString();
      return of(this.mockBookings[idx]).pipe(
        delay(800),
        tap(() => this.refreshBookings())
      );
    }
    return throwError(() => new Error('Booking not found'));
  }
}
