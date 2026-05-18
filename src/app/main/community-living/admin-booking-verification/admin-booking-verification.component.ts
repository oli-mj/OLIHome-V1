import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import {
  ModalController,
  ToastController,
  AlertController,
  IonRefresher,
  RefresherCustomEvent,
} from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import { Booking } from '../../../models/amenity.model';
import { BookingVerificationDetailModalComponent } from './booking-verification-detail-modal/booking-verification-detail-modal.component';

@Component({
  selector: 'app-admin-booking-verification',
  templateUrl: './admin-booking-verification.component.html',
  styleUrls: ['./admin-booking-verification.component.scss'],
  standalone: false,
})
export class AdminBookingVerificationComponent implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) refresher!: IonRefresher;

  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private amenityBookingService = inject(AmenityBookingService);
  private destroy$ = new Subject<void>();

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  isLoading = true;
  error: string | null = null;
  actionInProgress = false;

  ngOnInit() {
    this.loadBookings();
    this.subscribeToRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to booking refresh events
   */
  private subscribeToRefresh() {
    this.amenityBookingService
      .getBookingsRefresh$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadBookings();
      });
  }

  /**
   * Load all bookings for admin
   */
  loadBookings() {
    this.isLoading = true;
    this.error = null;

    this.amenityBookingService
      .getAllBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.bookings = data || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading bookings:', err);
          this.error = 'Failed to load bookings. Please try again.';
          this.isLoading = false;
          this.showErrorToast('Failed to load bookings');
        },
      });
  }

  /**
   * Apply filters based on selected status
   */
  applyFilters() {
    let filtered = [...this.bookings];

    if (this.selectedFilter !== 'all') {
      const statusMap = {
        pending: 'PENDING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
      };
      const status = statusMap[this.selectedFilter as keyof typeof statusMap];
      filtered = filtered.filter((b) => b.status === status);
    }

    // Sort by date descending
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    this.filteredBookings = filtered;
  }

  /**
   * Change filter and reapply
   */
  changeFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  /**
   * Pull-to-refresh handler
   */
  handleRefresh(event: RefresherCustomEvent) {
    this.amenityBookingService.refreshBookings();
    setTimeout(() => {
      if (this.refresher) {
        this.refresher.complete();
      }
      event.detail.complete();
    }, 500);
  }

  /**
   * Open booking detail modal
   */
  async openBookingDetail(booking: Booking) {
    const modal = await this.modalController.create({
      component: BookingVerificationDetailModalComponent,
      componentProps: { booking },
      cssClass: 'booking-verification-modal',
      backdropDismiss: false,
    });

    await modal.present();

    // Handle modal dismiss
    const { data } = await modal.onDidDismiss();
    if (data && data.updated) {
      // Booking was updated, reload list
      this.loadBookings();
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
   * Format date YYYY-MM-DD to readable format
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
   * Get filter statistics
   */
  getFilterStats(): { [key: string]: number } {
    return {
      all: this.bookings.length,
      pending: this.bookings.filter((b) => b.status === 'PENDING').length,
      approved: this.bookings.filter((b) => b.status === 'APPROVED').length,
      rejected: this.bookings.filter((b) => b.status === 'REJECTED').length,
    };
  }

  /**
   * Check if there are any bookings
   */
  hasBookings(): boolean {
    return this.bookings && this.bookings.length > 0;
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
   * Show success toast
   */
  showSuccessToast(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
  }

  /**
   * Show warning toast
   */
  showWarningToast(message: string) {
    this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'warning',
    });
  }
}
