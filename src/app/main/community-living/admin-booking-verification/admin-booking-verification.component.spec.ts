import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBookingVerificationComponent } from './admin-booking-verification.component';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import {
  ModalController,
  ToastController,
  AlertController,
  IonicModule,
} from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { Booking } from '../../../models/amenity.model';

describe('AdminBookingVerificationComponent', () => {
  let component: AdminBookingVerificationComponent;
  let fixture: ComponentFixture<AdminBookingVerificationComponent>;
  let mockBookingService: jasmine.SpyObj<AmenityBookingService>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;

  const mockBookings: Booking[] = [
    {
      id: '1',
      amenityId: 'am1',
      tenantId: 't1',
      tenantName: 'John Doe',
      amenityName: 'Pool',
      date: '2024-05-20',
      startTime: '08:00',
      endTime: '10:00',
      status: 'PENDING',
      attachmentUrl: 'data:image/png;base64,abc123',
    },
    {
      id: '2',
      amenityId: 'am2',
      tenantId: 't2',
      tenantName: 'Jane Smith',
      amenityName: 'Gym',
      date: '2024-05-21',
      startTime: '10:00',
      endTime: '12:00',
      status: 'APPROVED',
      attachmentUrl: 'data:application/pdf;base64,def456',
    },
    {
      id: '3',
      amenityId: 'am1',
      tenantId: 't3',
      tenantName: 'Bob Johnson',
      amenityName: 'Pool',
      date: '2024-05-22',
      startTime: '14:00',
      endTime: '16:00',
      status: 'REJECTED',
    },
  ];

  beforeEach(async () => {
    mockBookingService = jasmine.createSpyObj('AmenityBookingService', [
      'getAllBookings',
      'getBookingsRefresh$',
      'updateBookingStatus',
      'refreshBookings',
    ]);
    mockBookingService.getAllBookings.and.returnValue(of(mockBookings));
    mockBookingService.getBookingsRefresh$.and.returnValue(of(undefined));

    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [AdminBookingVerificationComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AmenityBookingService, useValue: mockBookingService },
        { provide: ToastController, useValue: mockToastController },
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBookingVerificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load bookings on init', () => {
      fixture.detectChanges();
      expect(mockBookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should set bookings data', () => {
      fixture.detectChanges();
      expect(component.bookings.length).toBe(3);
      expect(component.bookings[0].id).toBe('1');
    });
  });

  describe('loadBookings', () => {
    it('should load bookings successfully', (done) => {
      component.loadBookings();
      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.bookings.length).toBe(3);
        done();
      }, 100);
    });

    it('should handle error on booking load', (done) => {
      mockBookingService.getAllBookings.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      component.loadBookings();
      setTimeout(() => {
        expect(component.error).toBeTruthy();
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show all bookings when filter is "all"', () => {
      component.changeFilter('all');
      expect(component.filteredBookings.length).toBe(3);
    });

    it('should filter pending bookings', () => {
      component.changeFilter('pending');
      expect(component.filteredBookings.length).toBe(1);
      expect(component.filteredBookings[0].status).toBe('PENDING');
    });

    it('should filter approved bookings', () => {
      component.changeFilter('approved');
      expect(component.filteredBookings.length).toBe(1);
      expect(component.filteredBookings[0].status).toBe('APPROVED');
    });

    it('should filter rejected bookings', () => {
      component.changeFilter('rejected');
      expect(component.filteredBookings.length).toBe(1);
      expect(component.filteredBookings[0].status).toBe('REJECTED');
    });

    it('should sort bookings by date descending', () => {
      component.changeFilter('all');
      expect(component.filteredBookings[0].date).toBe('2024-05-22');
      expect(component.filteredBookings[2].date).toBe('2024-05-20');
    });
  });

  describe('changeFilter', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update selected filter', () => {
      component.changeFilter('pending');
      expect(component.selectedFilter).toBe('pending');
    });

    it('should apply filter when changed', () => {
      component.changeFilter('pending');
      expect(component.filteredBookings.length).toBe(1);
    });
  });

  describe('getStatusColor', () => {
    it('should return warning for PENDING', () => {
      expect(component.getStatusColor('PENDING')).toBe('warning');
    });

    it('should return success for APPROVED', () => {
      expect(component.getStatusColor('APPROVED')).toBe('success');
    });

    it('should return danger for REJECTED', () => {
      expect(component.getStatusColor('REJECTED')).toBe('danger');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = component.formatDate('2024-05-20');
      expect(result).toContain('May');
      expect(result).toContain('20');
      expect(result).toContain('2024');
    });

    it('should handle invalid date', () => {
      const result = component.formatDate('invalid');
      expect(result).toBe('invalid');
    });
  });

  describe('formatTime', () => {
    it('should convert 24-hour to 12-hour format', () => {
      expect(component.formatTime('08:00')).toBe('8:00 AM');
      expect(component.formatTime('14:00')).toBe('2:00 PM');
      expect(component.formatTime('00:00')).toBe('12:00 AM');
      expect(component.formatTime('12:00')).toBe('12:00 PM');
    });

    it('should handle invalid time format', () => {
      const result = component.formatTime('invalid');
      expect(result).toBe('invalid');
    });
  });

  describe('getFilterStats', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return correct statistics', () => {
      const stats = component.getFilterStats();
      expect(stats.all).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
    });
  });

  describe('hasBookings', () => {
    it('should return true when bookings exist', () => {
      fixture.detectChanges();
      expect(component.hasBookings()).toBe(true);
    });

    it('should return false when no bookings', () => {
      component.bookings = [];
      expect(component.hasBookings()).toBe(false);
    });
  });

  describe('handleRefresh', () => {
    it('should refresh bookings', (done) => {
      const mockEvent: any = {
        detail: { complete: jasmine.createSpy('complete') },
      };

      component.handleRefresh(mockEvent);
      expect(mockBookingService.refreshBookings).toHaveBeenCalled();

      setTimeout(() => {
        expect(mockEvent.detail.complete).toHaveBeenCalled();
        done();
      }, 600);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const destroySpy = spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
