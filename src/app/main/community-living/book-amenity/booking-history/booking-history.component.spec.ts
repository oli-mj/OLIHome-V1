import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BookingHistoryComponent } from './booking-history.component';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import { AuthService } from '../../../services/auth/auth.service';
import { of } from 'rxjs';
import { Booking } from '../../../models/amenity.model';

describe('BookingHistoryComponent', () => {
  let component: BookingHistoryComponent;
  let fixture: ComponentFixture<BookingHistoryComponent>;
  let amenityBookingService: jasmine.SpyObj<AmenityBookingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastController: jasmine.SpyObj<ToastController>;

  const mockBookings: Booking[] = [
    {
      id: '1',
      amenityId: 'amenity-1',
      tenantId: 'tenant-1',
      tenantName: 'John Doe',
      date: '2024-05-20',
      startTime: '08:00',
      endTime: '10:00',
      status: 'PENDING',
      attachmentUrl: 'http://example.com/file.pdf',
    },
    {
      id: '2',
      amenityId: 'amenity-1',
      tenantId: 'tenant-1',
      tenantName: 'John Doe',
      date: '2024-05-15',
      startTime: '14:00',
      endTime: '16:00',
      status: 'APPROVED',
      attachmentUrl: 'data:image/jpeg;base64,/9j/4AAQ',
    },
    {
      id: '3',
      amenityId: 'amenity-2',
      tenantId: 'tenant-1',
      tenantName: 'John Doe',
      date: '2024-05-10',
      startTime: '10:00',
      endTime: '12:00',
      status: 'REJECTED',
    },
  ];

  beforeEach(async () => {
    const amenityServiceSpy = jasmine.createSpyObj('AmenityBookingService', [
      'getTenantBookings',
      'getBookingsRefresh$',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserData']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', [
      'create',
      'getTop',
    ]);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);

    amenityServiceSpy.getTenantBookings.and.returnValue(of(mockBookings));
    amenityServiceSpy.getBookingsRefresh$.and.returnValue(of(undefined));
    authServiceSpy.getUserData.and.returnValue(
      Promise.resolve({ name: 'John Doe', email: 'john@example.com' })
    );
    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [BookingHistoryComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: AmenityBookingService, useValue: amenityServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
      ],
    }).compileComponents();

    amenityBookingService = TestBed.inject(
      AmenityBookingService
    ) as jasmine.SpyObj<AmenityBookingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    fixture = TestBed.createComponent(BookingHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize tenant ID and load bookings', async () => {
      await fixture.whenStable();
      expect(component.tenantId).toBe('john@example.com');
    });

    it('should load bookings on init', async () => {
      await fixture.whenStable();
      expect(amenityBookingService.getTenantBookings).toHaveBeenCalled();
    });
  });

  describe('changeFilter', () => {
    it('should filter by status', () => {
      component.bookings = mockBookings;
      component.changeFilter('pending');

      expect(component.selectedFilter).toBe('pending');
      expect(component.filteredBookings.length).toBe(1);
      expect(component.filteredBookings[0].status).toBe('PENDING');
    });

    it('should show all bookings with "all" filter', () => {
      component.bookings = mockBookings;
      component.changeFilter('all');

      expect(component.selectedFilter).toBe('all');
      expect(component.filteredBookings.length).toBe(3);
    });

    it('should sort bookings by date descending', () => {
      component.bookings = mockBookings;
      component.changeFilter('all');

      expect(component.filteredBookings[0].date).toBe('2024-05-20');
      expect(component.filteredBookings[1].date).toBe('2024-05-15');
      expect(component.filteredBookings[2].date).toBe('2024-05-10');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = component.formatDate('2024-05-20');
      expect(result).toContain('May');
      expect(result).toContain('20');
    });

    it('should return empty string for empty date', () => {
      expect(component.formatDate('')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format 24-hour time to 12-hour format', () => {
      expect(component.formatTime('08:00')).toBe('8:00 AM');
      expect(component.formatTime('20:00')).toBe('8:00 PM');
      expect(component.formatTime('12:00')).toBe('12:00 PM');
    });

    it('should return empty string for empty time', () => {
      expect(component.formatTime('')).toBe('');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for PENDING status', () => {
      expect(component.getStatusColor('PENDING')).toBe('warning');
    });

    it('should return correct color for APPROVED status', () => {
      expect(component.getStatusColor('APPROVED')).toBe('success');
    });

    it('should return correct color for REJECTED status', () => {
      expect(component.getStatusColor('REJECTED')).toBe('danger');
    });
  });

  describe('getFilterStats', () => {
    it('should return correct counts for each status', () => {
      component.bookings = mockBookings;
      const stats = component.getFilterStats();

      expect(stats.all).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
    });
  });

  describe('hasBookings', () => {
    it('should return true when there are bookings', () => {
      component.filteredBookings = mockBookings;
      expect(component.hasBookings()).toBe(true);
    });

    it('should return false when there are no bookings', () => {
      component.filteredBookings = [];
      expect(component.hasBookings()).toBe(false);
    });
  });

  describe('openBookingDetail', () => {
    it('should create and present modal', async () => {
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        component: BookingHistoryComponent,
      };
      modalController.create.and.returnValue(Promise.resolve(mockModal as any));
      modalController.getTop.and.returnValue(Promise.resolve(undefined));

      const booking = mockBookings[0];
      await component.openBookingDetail(booking);

      expect(modalController.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
    });
  });

  describe('loadBookings', () => {
    it('should load bookings and apply filters', async () => {
      component.tenantId = 'tenant-1';
      await component.loadBookings();

      expect(component.bookings.length).toBe(3);
      expect(component.filteredBookings.length).toBe(3);
    });

    it('should set error on failure', async () => {
      component.tenantId = 'tenant-1';
      amenityBookingService.getTenantBookings.and.returnValue(
        new Promise((_, reject) => reject(new Error('Network error')))
      );

      await component.loadBookings();

      expect(component.error).toBeTruthy();
    });
  });
});
