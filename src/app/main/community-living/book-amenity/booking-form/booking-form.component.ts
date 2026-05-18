 import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ToastController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';
import { FileUploadService, FilePreview } from '../../../../services/file-upload.service';
import {
  Booking,
  Amenity,
  TimeSlot,
} from '../../../../models/amenity.model';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
  standalone: false,
})
export class BookingFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private amenityBookingService = inject(AmenityBookingService);
  private fileUploadService = inject(FileUploadService);

  bookingForm!: FormGroup;
  isSubmitting = false;
  isUploading = false;

  // Form data from navigation
  amenity: Amenity | null = null;
  selectedDate: string | null = null;
  timeSlot: TimeSlot | null = null;
  tenantId: string = 'current-tenant-id'; // Should come from auth service
  tenantName: string = 'Current Tenant'; // Should come from auth service

  // File upload state
  selectedFile: FilePreview | null = null;
  uploadProgress = 0;
  allowedFileTypes: string = '';

  // Payment info
  paymentAmount: number = 0;
  isPaymentUpload = false;       // true when uploading payment for existing booking
  existingBooking: Booking | null = null;

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.amenity = state['amenity'];
      this.selectedDate = state['selectedDate'];
      this.timeSlot = state['timeSlot'];

      // Payment upload mode
      if (state['isPaymentUpload'] && state['existingBooking']) {
        this.isPaymentUpload = true;
        this.existingBooking = state['existingBooking'];
        const b = this.existingBooking!;
        this.selectedDate = b.date;
        this.timeSlot = { id: '', startTime: b.startTime, endTime: b.endTime };
      }
    }
  }

  ngOnInit() {
    this.allowedFileTypes = this.fileUploadService.getAllowedFileTypesString();
    this.initializeForm();
    this.calculatePaymentAmount();

    if (!this.isPaymentUpload && (!this.amenity || !this.selectedDate || !this.timeSlot)) {
      this.showErrorToast('Missing booking information. Please try again.');
      this.router.navigate(['/main/community-living/book-amenity']);
    }

    if (this.isPaymentUpload && !this.existingBooking) {
      this.showErrorToast('Missing booking data. Please try again.');
      this.router.navigate(['/main/community-living/book-amenity/history']);
    }
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm() {
    this.bookingForm = this.formBuilder.group({
      attachmentFile: [null, [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]],
    });
  }

  /**
   * Calculate payment amount from amenity config
   */
  private calculatePaymentAmount() {
    this.paymentAmount = this.amenity?.pricePerSlot || 0;
  }

  /**
   * Format time slot for display
   */
  formatTimeSlot(): string {
    if (!this.timeSlot) return '';
    return this.amenityBookingService.formatTimeSlot(this.timeSlot);
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

  /**
   * Trigger file input click
   */
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }

  /**
   * Handle file selection
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file
    const validation = this.fileUploadService.validateFile(file);
    if (!validation.valid) {
      this.showErrorToast(validation.error || 'File validation failed');
      return;
    }

    // Create preview
    try {
      this.isUploading = true;
      this.selectedFile = await this.fileUploadService.createFilePreview(file);
      this.bookingForm.patchValue({ attachmentFile: file });
      this.isUploading = false;
      this.showSuccessToast('File loaded successfully');
    } catch (error) {
      this.isUploading = false;
      console.error('Error creating file preview:', error);
      this.showErrorToast('Failed to process file');
    }
  }

  /**
   * Remove selected file
   */
  removeFile() {
    this.selectedFile = null;
    this.bookingForm.patchValue({ attachmentFile: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Submit booking form
   */
  async submitBooking() {
    if (this.bookingForm.invalid) {
      this.showErrorToast('Please fill in all required fields');
      return;
    }

    if (!this.selectedFile) {
      this.showErrorToast('Please upload a payment proof file');
      return;
    }

    // Show loading spinner
    const loading = await this.loadingController.create({
      message: this.isPaymentUpload ? 'Uploading payment...' : 'Submitting booking...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      this.isSubmitting = true;

      if (this.isPaymentUpload && this.existingBooking?.id) {
        // Upload payment proof for existing approved booking
        this.amenityBookingService.uploadPayment(this.existingBooking.id, this.selectedFile.file).subscribe({
          next: () => {
            loading.dismiss();
            this.isSubmitting = false;
            this.showSuccessToast('Payment proof uploaded successfully!');
            this.amenityBookingService.refreshBookings();
            setTimeout(() => {
              this.router.navigate(['/main/community-living/book-amenity/history']);
            }, 1500);
          },
          error: (err: any) => {
            loading.dismiss();
            this.isSubmitting = false;
            this.showErrorToast(err.message || 'Failed to upload payment. Please try again.');
          }
        });
      } else {
        // Should not reach here in the new flow, but keep as fallback
        const booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
          amenityId: this.amenity!.id,
          tenantId: this.tenantId,
          tenantName: this.tenantName,
          date: this.selectedDate!,
          startTime: this.timeSlot!.startTime,
          endTime: this.timeSlot!.endTime,
          status: 'PENDING',
          attachmentFile: this.selectedFile.file,
        };

        this.amenityBookingService.createBookingWithAttachment(booking).subscribe({
          next: () => {
            loading.dismiss();
            this.isSubmitting = false;
            this.showSuccessToast('Booking submitted — pending verification');
            this.amenityBookingService.refreshBookings();
            setTimeout(() => {
              this.router.navigate(['/main/community-living/book-amenity']);
            }, 1500);
          },
          error: (err: any) => {
            loading.dismiss();
            this.isSubmitting = false;
            this.showErrorToast(err.message || 'Failed to submit booking. Please try again.');
          },
        });
      }
    } catch (error) {
      loading.dismiss();
      this.isSubmitting = false;
      console.error('Unexpected error:', error);
      this.showErrorToast('An unexpected error occurred');
    }
  }

  /**
   * Cancel booking and go back
   */
  cancelBooking() {
    this.router.navigate(['/main/community-living/book-amenity']);
  }

  /**
   * Show success toast
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
   * Show error toast
   */
  private showErrorToast(message: string) {
    this.toastController
      .create({
        message,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
        icon: 'alert-circle',
      })
      .then((toast) => toast.present());
  }

  /**
   * Get file size display
   */
  getFileSizeDisplay(): string {
    if (!this.selectedFile) return '';
    return this.selectedFile.fileSize;
  }

  /**
   * Check if preview is an image
   */
  isImagePreview(): boolean {
    if (!this.selectedFile) return false;
    return this.selectedFile.file.type.startsWith('image/');
  }

  /**
   * Check if preview is a PDF
   */
  isPdfPreview(): boolean {
    if (!this.selectedFile) return false;
    return this.selectedFile.file.type === 'application/pdf';
  }
}
