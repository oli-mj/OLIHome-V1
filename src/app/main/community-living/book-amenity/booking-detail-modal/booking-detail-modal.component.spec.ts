import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { BookingDetailModalComponent } from './booking-detail-modal.component';
import { Booking } from '../../../models/amenity.model';

describe('BookingDetailModalComponent', () => {
  let component: BookingDetailModalComponent;
  let fixture: ComponentFixture<BookingDetailModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastController: jasmine.SpyObj<ToastController>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustUrl',
    ]);

    await TestBed.configureTestingModule({
      declarations: [BookingDetailModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
    }).compileComponents();

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

    fixture = TestBed.createComponent(BookingDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setBooking', () => {
    it('should set booking data', () => {
      const booking: Booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'http://example.com/file.pdf',
      };

      component.setBooking(booking);
      expect(component.booking).toEqual(booking);
    });

    it('should load attachment preview when booking has URL', () => {
      const booking: Booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'data:image/jpeg;base64,/9j/4AAQ',
      };

      sanitizer.bypassSecurityTrustUrl.and.returnValue('safe-url' as any);
      component.setBooking(booking);

      expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
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

    it('should return medium color for unknown status', () => {
      expect(component.getStatusColor('UNKNOWN')).toBe('medium');
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

  describe('closeModal', () => {
    it('should dismiss modal', () => {
      component.closeModal();
      expect(modalController.dismiss).toHaveBeenCalled();
    });
  });

  describe('isPdfAttachment', () => {
    it('should return true for PDF attachment', () => {
      component.booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      };

      expect(component.isPdfAttachment()).toBe(true);
    });

    it('should return false for image attachment', () => {
      component.booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'data:image/jpeg;base64,/9j/4AAQ',
      };

      expect(component.isPdfAttachment()).toBe(false);
    });
  });

  describe('isImageAttachment', () => {
    it('should return true for image attachment', () => {
      component.booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'data:image/jpeg;base64,/9j/4AAQ',
      };

      expect(component.isImageAttachment()).toBe(true);
    });

    it('should return false for PDF attachment', () => {
      component.booking = {
        id: '1',
        amenityId: 'amenity-1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        date: '2024-05-20',
        startTime: '08:00',
        endTime: '10:00',
        status: 'PENDING',
        attachmentUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      };

      expect(component.isImageAttachment()).toBe(false);
    });
  });
});
