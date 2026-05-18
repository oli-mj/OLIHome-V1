import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingVerificationDetailModalComponent } from './booking-verification-detail-modal.component';
import {
  ModalController,
  LoadingController,
  ToastController,
  AlertController,
  IonicModule,
} from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AmenityBookingService } from '../../../../services/amenity-booking.service';
import { of, throwError } from 'rxjs';
import { Booking } from '../../../../models/amenity.model';

describe('BookingVerificationDetailModalComponent', () => {
  let component: BookingVerificationDetailModalComponent;
  let fixture: ComponentFixture<BookingVerificationDetailModalComponent>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockLoadingController: jasmine.SpyObj<LoadingController>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockBookingService: jasmine.SpyObj<AmenityBookingService>;

  const mockBooking: Booking = {
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
  };

  beforeEach(async () => {
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    mockLoadingController = jasmine.createSpyObj('LoadingController', ['create']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    mockBookingService = jasmine.createSpyObj('AmenityBookingService', [
      'updateBookingStatus',
    ]);

    mockSanitizer.bypassSecurityTrustUrl.and.returnValue('safe-url' as any);
    mockToastController.create.and.returnValue(Promise.resolve({} as any));
    mockAlertController.create.and.returnValue(Promise.resolve({} as any));

    await TestBed.configureTestingModule({
      declarations: [BookingVerificationDetailModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: mockModalController },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
        { provide: AlertController, useValue: mockAlertController },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: AmenityBookingService, useValue: mockBookingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingVerificationDetailModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setBooking', () => {
    it('should set booking data', () => {
      component.setBooking(mockBooking);
      expect(component.booking).toEqual(mockBooking);
    });

    it('should load attachment preview when booking has URL', () => {
      component.setBooking(mockBooking);
      expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(
        mockBooking.attachmentUrl
      );
    });

    it('should not load attachment when URL is missing', () => {
      const bookingNoAttachment = { ...mockBooking, attachmentUrl: undefined };
      mockSanitizer.bypassSecurityTrustUrl.calls.reset();
      component.setBooking(bookingNoAttachment);
      expect(mockSanitizer.bypassSecurityTrustUrl).not.toHaveBeenCalled();
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

  describe('getTimeSlotDisplay', () => {
    it('should return formatted time range', () => {
      component.setBooking(mockBooking);
      const result = component.getTimeSlotDisplay();
      expect(result).toContain('8:00 AM');
      expect(result).toContain('10:00 AM');
    });

    it('should return empty string when no booking', () => {
      component.booking = null;
      expect(component.getTimeSlotDisplay()).toBe('');
    });
  });

  describe('isPdfAttachment', () => {
    it('should detect PDF by content type', () => {
      component.setBooking({
        ...mockBooking,
        attachmentUrl: 'data:application/pdf;base64,abc',
      });
      expect(component.isPdfAttachment()).toBe(true);
    });

    it('should detect PDF by extension', () => {
      component.setBooking({
        ...mockBooking,
        attachmentUrl: 'https://example.com/file.pdf',
      });
      expect(component.isPdfAttachment()).toBe(true);
    });

    it('should return false for non-PDF', () => {
      component.setBooking(mockBooking);
      expect(component.isPdfAttachment()).toBe(false);
    });
  });

  describe('isImageAttachment', () => {
    it('should detect image attachment', () => {
      component.setBooking(mockBooking);
      expect(component.isImageAttachment()).toBe(true);
    });

    it('should return false for non-image', () => {
      component.setBooking({
        ...mockBooking,
        attachmentUrl: 'https://example.com/file.txt',
      });
      expect(component.isImageAttachment()).toBe(false);
    });
  });

  describe('approveBooking', () => {
    it('should call updateBookingStatus with APPROVED', (done) => {
      const mockUpdatedBooking = { ...mockBooking, status: 'APPROVED' };
      mockBookingService.updateBookingStatus.and.returnValue(
        of(mockUpdatedBooking)
      );

      const mockLoading: any = { dismiss: jasmine.createSpy('dismiss') };
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));

      component.setBooking(mockBooking);
      component['approveBooking']();

      setTimeout(() => {
        expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith(
          '1',
          'APPROVED'
        );
        expect(mockModalController.dismiss).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('rejectBooking', () => {
    it('should call updateBookingStatus with REJECTED', (done) => {
      const mockUpdatedBooking = { ...mockBooking, status: 'REJECTED' };
      mockBookingService.updateBookingStatus.and.returnValue(
        of(mockUpdatedBooking)
      );

      const mockLoading: any = { dismiss: jasmine.createSpy('dismiss') };
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));

      component.setBooking(mockBooking);
      component['rejectBooking']();

      setTimeout(() => {
        expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith(
          '1',
          'REJECTED'
        );
        expect(mockModalController.dismiss).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('showApproveConfirmation', () => {
    it('should create alert with approve message', (done) => {
      const mockAlert: any = {
        present: jasmine.createSpy('present'),
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert));

      component.setBooking(mockBooking);
      component.showApproveConfirmation().then(() => {
        expect(mockAlertController.create).toHaveBeenCalled();
        const args = mockAlertController.create.calls.mostRecent().args[0];
        expect(args.header).toContain('Approve');
        done();
      });
    });
  });

  describe('showRejectConfirmation', () => {
    it('should create alert with reject message', (done) => {
      const mockAlert: any = {
        present: jasmine.createSpy('present'),
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert));

      component.setBooking(mockBooking);
      component.showRejectConfirmation().then(() => {
        expect(mockAlertController.create).toHaveBeenCalled();
        const args = mockAlertController.create.calls.mostRecent().args[0];
        expect(args.header).toContain('Reject');
        done();
      });
    });
  });

  describe('closeModal', () => {
    it('should dismiss modal', () => {
      component.closeModal();
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });
  });
});
