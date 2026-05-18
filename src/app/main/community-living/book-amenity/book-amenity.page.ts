import {
  Component,
  OnInit,
  inject,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import { TimeSlotWithBooking, Amenity } from '../../../models/amenity.model';
import { TimeSlotsModalComponent } from './time-slots-modal/time-slots-modal.component';

@Component({
  selector: 'app-book-amenity',
  templateUrl: './book-amenity.page.html',
  styleUrls: ['./book-amenity.page.scss'],
  standalone: false,
})
export class BookAmenityPage implements OnInit {
  @ViewChild('calendar') calendarComponent: any;

  private router = inject(Router);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private amenityBookingService = inject(AmenityBookingService);

  // Amenity data
  selectedAmenity!: Amenity;

  selectedSlot: TimeSlotWithBooking | null = null;
  selectedDate: string | null = null;
  isLoading = true;

  ngOnInit() {
    this.amenityBookingService.getAmenities().subscribe((amenities) => {
      if (amenities && amenities.length > 0) {
        this.selectedAmenity = amenities[0];
      }
      this.isLoading = false;
    });
  }

  /**
   * Handle day selection from calendar
   */
  onDaySelected(date: string) {
    this.selectedDate = date;
    this.openTimeSlotsModal(date);
  }

  /**
   * Open modal to show time slots for selected day
   */
  async openTimeSlotsModal(date: string) {
    const modal = await this.modalController.create({
      component: TimeSlotsModalComponent,
      componentProps: {
        amenityId: this.selectedAmenity.id,
        selectedDate: date,
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.bookingCreated) {
      if (data.amenity) {
        this.selectedAmenity = data.amenity;
      }
      setTimeout(() => this.refreshCalendar(), 100);
      this.router.navigate(['/main/community-living']);
    }
  }

  /**
   * Handle time slot selection from modal
   */
  onTimeSlotSelected(slot: TimeSlotWithBooking) {
    this.selectedSlot = slot;
    this.showSuccessToast(
      `Selected: ${this.amenityBookingService.formatTimeSlot(slot)}`
    );
    // Proceed to booking form
    this.proceedToBookingForm(slot);
  }

  /**
   * Proceed to booking form (next step after slot selection)
   */
  proceedToBookingForm(slot: TimeSlotWithBooking) {
    if (!this.selectedSlot || !this.selectedDate || !this.selectedAmenity) {
      this.showErrorToast('Please select a time slot first');
      return;
    }

    // Navigate to booking form with selected details
    this.router.navigate(
      ['/main/community-living/book-amenity/booking-form'],
      {
        state: {
          amenity: this.selectedAmenity,
          selectedDate: this.selectedDate,
          timeSlot: slot,
        },
      }
    );
  }

  /**
   * Refresh calendar data
   */
  refreshCalendar() {
    if (this.calendarComponent) {
      this.calendarComponent.loadCalendar();
    }
  }

  /**
   * Show success toast notification
   */
  private showSuccessToast(message: string) {
    this.toastController
      .create({
        message,
        duration: 2000,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle',
      })
      .then((toast) => toast.present());
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(message: string) {
    this.toastController
      .create({
        message,
        duration: 2000,
        position: 'bottom',
        color: 'danger',
        icon: 'alert-circle',
      })
      .then((toast) => toast.present());
  }

  /**
   * Show info toast notification
   */
  private showInfoToast(message: string) {
    this.toastController
      .create({
        message,
        duration: 2000,
        position: 'bottom',
        color: 'primary',
        icon: 'information-circle',
      })
      .then((toast) => toast.present());
  }

  /**
   * Navigate to booking history
   */
  navigateToHistory() {
    this.router.navigate(['/main/community-living/book-amenity/history']);
  }
}
