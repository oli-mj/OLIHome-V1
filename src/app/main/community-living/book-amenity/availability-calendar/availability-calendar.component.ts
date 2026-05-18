import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';
import { DayAvailability } from '../../../../models/amenity.model';

@Component({
  selector: 'app-availability-calendar',
  templateUrl: './availability-calendar.component.html',
  styleUrls: ['./availability-calendar.component.scss'],
  standalone: false,
})
export class AvailabilityCalendarComponent implements OnInit {
  @Input() amenityId!: string;
  @Output() daySelected = new EventEmitter<string>(); // Emit date in YYYY-MM-DD format

  private amenityBookingService = inject(AmenityBookingService);

  currentDate = new Date();
  currentMonth = this.currentDate.getMonth() + 1;
  currentYear = this.currentDate.getFullYear();
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: (number | null)[] = [];
  monthAvailability: { [key: string]: DayAvailability } = {};
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadCalendar();
  }

  /**
   * Load the calendar data for the current month
   */
  loadCalendar() {
    this.isLoading = true;
    this.errorMessage = '';

    this.amenityBookingService
      .getMonthAvailability(this.amenityId, this.currentYear, this.currentMonth)
      .subscribe({
        next: (availability: any) => {
          this.monthAvailability = availability;
          this.generateCalendarDays();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading calendar:', err);
          this.errorMessage = 'Failed to load availability data';
          this.isLoading = false;
        },
      });
  }

  /**
   * Generate the calendar days array for the month
   */
  private generateCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    this.calendarDays = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }

  /**
   * Get availability status for a specific day
   */
  getAvailabilityStatus(day: number | null): DayAvailability | null {
    if (day === null) return null;

    const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.monthAvailability[dateStr] || null;
  }

  /**
   * Get the CSS class for day cell color based on availability
   */
  getDayStatusClass(day: number | null): string {
    const availability = this.getAvailabilityStatus(day);
    if (!availability) return 'day-empty';

    switch (availability.status) {
      case 'available':
        return 'day-available'; // Green
      case 'partially-booked':
        return 'day-partially-booked'; // Yellow
      case 'fully-booked':
        return 'day-fully-booked'; // Red
      default:
        return '';
    }
  }

  /**
   * Get tooltip text for a day
   */
  getDayTooltip(day: number | null): string {
    const availability = this.getAvailabilityStatus(day);
    if (!availability) return '';

    return `${availability.availableSlots}/${availability.totalSlots} slots available`;
  }

  /**
   * On day cell click, emit the selected date
   */
  onDayClick(day: number | null) {
    if (day === null) return;

    const availability = this.getAvailabilityStatus(day);
    if (!availability) return;

    const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.daySelected.emit(dateStr);
  }

  /**
   * Navigate to previous month
   */
  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadCalendar();
  }

  /**
   * Navigate to next month
   */
  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendar();
  }

  /**
   * Get the display name for the current month
   */
  getMonthName(): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[this.currentMonth - 1];
  }
}
