import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Booking } from '../../../../models/amenity.model';

@Component({
  selector: 'app-booking-detail-modal',
  templateUrl: './booking-detail-modal.component.html',
  styleUrls: ['./booking-detail-modal.component.scss'],
  standalone: false,
})
export class BookingDetailModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  booking: Booking | null = null;
  attachmentPreview: SafeUrl | null = null;
  isLoadingAttachment = false;

  ngOnInit() {
    // Booking data is passed through route state or modal componentProps
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
   * Load attachment preview from URL
   */
  private loadAttachmentPreview() {
    if (!this.booking?.attachmentUrl) return;

    this.isLoadingAttachment = true;
    
    // If URL is a data URL (from file preview), use directly
    if (this.booking.attachmentUrl.startsWith('data:')) {
      this.attachmentPreview = this.sanitizer.bypassSecurityTrustUrl(
        this.booking.attachmentUrl
      );
      this.isLoadingAttachment = false;
      return;
    }

    // If URL is from server, fetch and create preview
    // For now, just use the URL directly
    this.attachmentPreview = this.sanitizer.bypassSecurityTrustUrl(
      this.booking.attachmentUrl
    );
    this.isLoadingAttachment = false;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warning'; // Yellow
      case 'APPROVED':
        return 'success'; // Green
      case 'REJECTED':
        return 'danger'; // Red
      default:
        return 'medium';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format time for display
   */
  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
  }

  /**
   * Format time slot display
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
    if (!this.booking?.attachmentUrl) return false;
    return (
      this.booking.attachmentUrl.includes('application/pdf') ||
      this.booking.attachmentUrl.includes('.pdf')
    );
  }

  /**
   * Check if attachment is image
   */
  isImageAttachment(): boolean {
    if (!this.booking?.attachmentUrl) return false;
    return this.booking.attachmentUrl.includes('image/');
  }

  /**
   * Download attachment
   */
  async downloadAttachment() {
    if (!this.booking?.attachmentUrl) return;

    try {
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = this.booking.attachmentUrl;
      link.download = `booking-${this.booking.id}-attachment`;
      link.click();

      await this.showSuccessToast('Attachment downloaded');
    } catch (error) {
      console.error('Download error:', error);
      await this.showErrorToast('Failed to download attachment');
    }
  }

  /**
   * Navigate to payment upload form
   */
  proceedToPayment() {
    if (!this.booking) return;
    this.modalController.dismiss();
    this.router.navigate(['/main/community-living/book-amenity/booking-form'], {
      state: {
        existingBooking: this.booking,
        isPaymentUpload: true,
      },
    });
  }

  /**
   * Close modal
   */
  closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Show success toast
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  /**
   * Show error toast
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
