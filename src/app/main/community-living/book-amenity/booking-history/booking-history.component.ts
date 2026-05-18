import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import {
  ModalController,
  ToastController,
  LoadingController,
  RefresherCustomEvent,
  IonRefresher,
} from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Booking } from '../../../../models/amenity.model';
import { BookingDetailModalComponent } from '../booking-detail-modal/booking-detail-modal.component';

@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.scss'],
  standalone: false,
})
export class BookingHistoryComponent implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) refresher!: IonRefresher;

  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private amenityBookingService = inject(AmenityBookingService);
  private authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;
  isRefreshing = false;
  error: string | null = null;

  tenantId: string | null = null;
  selectedFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';

  // Date range for filtering
  startDate: string = '';
  endDate: string = '';

  ngOnInit() {
    this.initializeTenantId();
    this.setupAutoRefresh();
    this.loadBookings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize tenant ID from auth service
   */
  private initializeTenantId() {
    this.authService.getUserData().then((user: any) => {
      if (user) {
        // Use tenantId if available, otherwise use email
        this.tenantId = user.tenantId || user.email || 'unknown-tenant';
      }
    });
  }

  /**
   * Subscribe to booking refresh events
   */
  private setupAutoRefresh() {
    // Subscribe to bookings refresh when new booking is created
    this.amenityBookingService
      .getBookingsRefresh$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadBookings();
      });
  }

  /**
   * Load bookings for current tenant
   */
  async loadBookings() {
    if (!this.tenantId) {
      this.showErrorToast('Unable to load tenant information');
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Get all bookings for the tenant
      const allBookings = await this.amenityBookingService
        .getTenantBookings(this.tenantId)
        .toPromise();

      this.bookings = allBookings || [];
      this.applyFilters();
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      this.error = err?.message || 'Failed to load bookings';
      this.showErrorToast('Failed to load bookings');
    } finally {
      this.isLoading = false;
      if (this.isRefreshing) {
        this.isRefreshing = false;
      }
    }
  }

  /**
   * Apply filters to bookings
   */
  applyFilters() {
    let filtered = [...this.bookings];

    // Filter by status
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === this.selectedFilter.toUpperCase());
    }

    // Filter by date range if provided
    if (this.startDate) {
      filtered = filtered.filter((b) => b.date >= this.startDate);
    }
    if (this.endDate) {
      filtered = filtered.filter((b) => b.date <= this.endDate);
    }

    // Sort by date descending (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.startTime).getTime();
      const dateB = new Date(b.date + ' ' + b.startTime).getTime();
      return dateB - dateA;
    });

    this.filteredBookings = filtered;
  }

  /**
   * Handle pull-to-refresh
   */
  async handleRefresh(event: RefresherCustomEvent) {
    this.isRefreshing = true;
    await this.loadBookings();
    event.detail.complete();
  }

  /**
   * Change filter
   */
  changeFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  /**
   * Open booking detail modal
   */
  async openBookingDetail(booking: Booking) {
    const modal = await this.modalController.create({
      component: BookingDetailModalComponent,
      cssClass: 'booking-detail-modal',
      presentingElement: await this.modalController.getTop(),
    });

    await modal.present();

    // Set booking data after modal is presented
    const component = modal.component as any;
    if (component) {
      component.setBooking(booking);
    }
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
  getTimeSlotDisplay(booking: Booking): string {
    return `${this.formatTime(booking.startTime)} – ${this.formatTime(booking.endTime)}`;
  }

  /**
   * Get amenity name for display
   */
  getAmenityDisplay(booking: Booking): string {
    // In a real app, fetch amenity from service
    return `Amenity ${booking.amenityId}`;
  }

  /**
   * Check if bookings list is empty
   */
  hasBookings(): boolean {
    return this.filteredBookings.length > 0;
  }

  /**
   * Get filter stats
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
}
