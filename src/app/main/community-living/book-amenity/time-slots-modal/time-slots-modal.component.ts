import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';
import { TimeSlotWithBooking, Booking, Amenity } from '../../../../models/amenity.model';

@Component({
  selector: 'app-time-slots-modal',
  templateUrl: './time-slots-modal.component.html',
  styleUrls: ['./time-slots-modal.component.scss'],
  standalone: false,
})
export class TimeSlotsModalComponent implements OnInit {
  @Input() amenityId!: string;
  @Input() selectedDate!: string; // YYYY-MM-DD format
  @Output() slotSelected = new EventEmitter<TimeSlotWithBooking>();

  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private router = inject(Router);
  private amenityBookingService = inject(AmenityBookingService);

  timeSlots: TimeSlotWithBooking[] = [];
  amenities: Amenity[] = [];
  selectedAmenity!: Amenity;
  isLoading = false;
  errorMessage = '';
  selectedSlot: TimeSlotWithBooking | null = null;

  ngOnInit() {
    this.loadAmenities();
  }

  /**
   * Load amenities for the selector
   */
  loadAmenities() {
    this.amenityBookingService.getAmenities().subscribe({
      next: (amenities: Amenity[]) => {
        this.amenities = amenities;
        // Find the initially selected amenity or default to first
        this.selectedAmenity = this.amenities.find(a => a.id === this.amenityId) || this.amenities[0];
        this.amenityId = this.selectedAmenity.id;
        this.loadTimeSlots();
      },
      error: (err: any) => {
        console.error('Error loading amenities:', err);
        this.showErrorToast('Failed to load amenities');
      }
    });
  }

  /**
   * Handle amenity selection
   */
  onAmenitySelected(amenity: Amenity) {
    if (this.amenityId !== amenity.id) {
      this.amenityId = amenity.id;
      this.selectedAmenity = amenity;
      this.selectedSlot = null; // Reset slot when changing amenity
      this.loadTimeSlots();
    }
  }

  /**
   * Handle amenity selection from UI
   */
  onAmenityChanged(event: any) {
    const id = event.detail.value;
    const amenity = this.amenities.find(a => a.id === id);
    if (amenity) {
      this.onAmenitySelected(amenity);
    }
  }

  /**
   * Load time slots for the selected date
   */
  loadTimeSlots() {
    this.isLoading = true;
    this.errorMessage = '';

    this.amenityBookingService
      .getTimeSlotsWithBookings(this.amenityId, this.selectedDate)
      .subscribe({
        next: (slots: any) => {
          this.timeSlots = slots;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading time slots:', err);
          this.errorMessage = 'Failed to load time slots';
          this.isLoading = false;
          this.showErrorToast('Failed to load time slots');
        },
      });
  }

  /**
   * Format time slot for display
   */
  formatTimeSlot(slot: TimeSlotWithBooking): string {
    return this.amenityBookingService.formatTimeSlot(slot);
  }

  /**
   * Get the status chip color and text
   */
  getStatusChip(slot: TimeSlotWithBooking): {
    color: string;
    text: string;
  } {
    if (slot.isBooked) {
      return { color: 'danger', text: 'Booked' };
    }
    return { color: 'success', text: 'Available' };
  }

  /**
   * Get tenant name for booked slot
   */
  getTenantName(slot: TimeSlotWithBooking): string {
    return slot.booking?.tenantName || '';
  }

  /**
   * Check if a slot is selectable (not booked)
   */
  isSelectableSlot(slot: TimeSlotWithBooking): boolean {
    return !slot.isBooked;
  }

  /**
   * On slot click, select the slot if available
   */
  onSlotClick(slot: TimeSlotWithBooking) {
    if (!this.isSelectableSlot(slot)) {
      this.showErrorToast('This time slot is already booked');
      return;
    }

    this.selectedSlot = slot;
  }

  /**
   * Confirm slot selection and emit event
   */
  async confirmSelection() {
    if (!this.selectedSlot) {
      this.showErrorToast('Please select a time slot');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Booking Request',
      message: 'Do you want to request this time slot? It will be sent to the village management for verification.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          role: 'confirm',
          handler: () => {
            this.submitBookingRequest();
          },
        },
      ],
    });

    await alert.present();
  }

  submitBookingRequest() {
    this.isLoading = true;
    
    // Create pending booking
    const booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      amenityId: this.selectedAmenity.id,
      tenantId: 'current-tenant-id', // In real app, get from auth
      tenantName: 'Current Tenant',
      amenityName: this.selectedAmenity.name,
      date: this.selectedDate,
      startTime: this.selectedSlot!.startTime,
      endTime: this.selectedSlot!.endTime,
      status: 'PENDING'
    };

    this.amenityBookingService.createBooking(booking).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastController.create({
          message: 'Booking request sent for verification.',
          duration: 3000,
          color: 'success',
          position: 'bottom'
        }).then((t: HTMLIonToastElement) => t.present());
        
        this.modalController.dismiss({ bookingCreated: true, amenity: this.selectedAmenity });
      },
      error: (err: any) => {
        console.error('Error creating booking:', err);
        this.isLoading = false;
        this.showErrorToast('Failed to create booking request');
      }
    });
  }

  /**
   * Close modal without selecting
   */
  closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Show error toast
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
      .then((toast: HTMLIonToastElement) => toast.present());
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
