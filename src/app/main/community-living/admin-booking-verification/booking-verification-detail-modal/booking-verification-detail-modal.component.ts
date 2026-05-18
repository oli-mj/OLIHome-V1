import { Component, OnInit, inject } from '@angular/core';
import {
  ModalController,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Booking } from '../../../../models/amenity.model';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';

@Component({
  selector: 'app-booking-verification-detail-modal',
  templateUrl: './booking-verification-detail-modal.component.html',
  styleUrls: ['./booking-verification-detail-modal.component.scss'],
  standalone: false,
})
export class BookingVerificationDetailModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private sanitizer = inject(DomSanitizer);
  private amenityBookingService = inject(AmenityBookingService);

  booking: Booking | null = null;
  attachmentPreview: SafeUrl | null = null;
  isLoadingAttachment = false;
  isProcessing = false;

  ngOnInit() {
    // Booking data is passed through setBooking()
  }

  /**
   * Set booking data (called from parent)
   */
  setBooking(booking: Booking) {
    this.booking = booking;
    if (booking.attachmentUrl) {
      this.loadAttachmentPreview();
    }
  }

  /**
   * Load and sanitize attachment for preview
   */
  private loadAttachmentPreview() {
    this.isLoadingAttachment = true;
    try {
      if (this.booking?.attachmentUrl) {
        this.attachmentPreview = this.sanitizer.bypassSecurityTrustUrl(
          this.booking.attachmentUrl
        );
      }
    } catch (error) {
      console.error('Error loading attachment:', error);
    } finally {
      this.isLoadingAttachment = false;
    }
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): 'warning' | 'success' | 'danger' {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'warning';
    }
  }

  /**
   * Format date from YYYY-MM-DD to readable format
   */
  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Format time from HH:mm to 12-hour format
   */
  formatTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  }

  /**
   * Get formatted time slot display
   */
  getTimeSlotDisplay(): string {
    if (!this.booking) return '';
    return `${this.formatTime(this.booking.startTime)} – ${this.formatTime(
      this.booking.endTime
    )}`;
  }

  /**
   * Check if attachment is PDF
   */
  isPdfAttachment(): boolean {
    return (
      this.booking?.attachmentUrl?.includes('application/pdf') ||
      this.booking?.attachmentUrl?.includes('.pdf') ||
      false
    );
  }

  /**
   * Check if attachment is image
   */
  isImageAttachment(): boolean {
    return this.booking?.attachmentUrl?.includes('image') || false;
  }

  /**
   * Download attachment
   */
  downloadAttachment() {
    if (!this.booking?.attachmentUrl) {
      this.showWarningToast('No attachment available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = this.booking.attachmentUrl;
      link.download = `booking-${this.booking.id}-attachment`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showSuccessToast('Downloading attachment...');
    } catch (error) {
      console.error('Download error:', error);
      this.showErrorToast('Failed to download attachment');
    }
  }

  /**
   * Show confirmation alert for approve
   */
  async showApproveConfirmation() {
    const alert = await this.alertController.create({
      header: 'Approve Booking',
      message: `Are you sure you want to approve this booking for ${this.booking?.tenantName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Approve',
          cssClass: 'alert-approve',
          handler: () => {
            this.approveBooking();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Show confirmation alert for reject
   */
  async showRejectConfirmation() {
    const alert = await this.alertController.create({
      header: 'Reject Booking',
      message: `Are you sure you want to reject this booking for ${this.booking?.tenantName}?`,
      subHeader: 'The tenant will be notified about the rejection.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Reject',
          cssClass: 'alert-reject',
          handler: () => {
            this.rejectBooking();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Approve booking
   */
  private async approveBooking() {
    if (!this.booking?.id) {
      this.showErrorToast('Booking ID not found');
      return;
    }

    this.isProcessing = true;
    const loading = await this.loadingController.create({
      message: 'Approving booking...',
    });
    await loading.present();

    this.amenityBookingService
      .updateBookingStatus(this.booking.id, 'APPROVED')
      .subscribe({
        next: (updated: any) => {
          loading.dismiss();
          this.isProcessing = false;
          this.showSuccessToast('Booking approved successfully');
          // Close modal with updated flag
          this.modalController.dismiss({ updated: true, booking: updated });
        },
        error: (err: any) => {
          loading.dismiss();
          this.isProcessing = false;
          console.error('Approve error:', err);
          this.showErrorToast('Failed to approve booking');
        },
      });
  }

  /**
   * Reject booking
   */
  private async rejectBooking() {
    if (!this.booking?.id) {
      this.showErrorToast('Booking ID not found');
      return;
    }

    this.isProcessing = true;
    const loading = await this.loadingController.create({
      message: 'Rejecting booking...',
    });
    await loading.present();

    this.amenityBookingService
      .updateBookingStatus(this.booking.id, 'REJECTED')
      .subscribe({
        next: (updated: any) => {
          loading.dismiss();
          this.isProcessing = false;
          this.showSuccessToast('Booking rejected successfully');
          // Close modal with updated flag
          this.modalController.dismiss({ updated: true, booking: updated });
        },
        error: (err: any) => {
          loading.dismiss();
          this.isProcessing = false;
          console.error('Reject error:', err);
          this.showErrorToast('Failed to reject booking');
        },
      });
  }

  /**
   * Close modal without action
   */
  closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Show success toast
   */
  private showSuccessToast(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
  }

  /**
   * Show error toast
   */
  private showErrorToast(message: string) {
    this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
  }

  /**
   * Show warning toast
   */
  private showWarningToast(message: string) {
    this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'warning',
    });
  }
}
