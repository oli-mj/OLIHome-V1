import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { of, throwError } from 'rxjs';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let router: Router;
  let amenityBookingService: AmenityBookingService;
  let fileUploadService: FileUploadService;
  let toastController: ToastController;
  let loadingController: LoadingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingFormComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        AmenityBookingService,
        FileUploadService,
        ToastController,
        LoadingController,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    amenityBookingService = TestBed.inject(AmenityBookingService);
    fileUploadService = TestBed.inject(FileUploadService);
    toastController = TestBed.inject(ToastController);
    loadingController = TestBed.inject(LoadingController);

    // Set up component state
    component.amenity = {
      id: 'test-amenity',
      name: 'Test Amenity',
      pricePerSlot: 50,
    };
    component.selectedDate = '2024-05-15';
    component.timeSlot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on init', () => {
    component.ngOnInit();
    expect(component.bookingForm).toBeDefined();
    expect(component.bookingForm.get('attachmentFile')).toBeDefined();
    expect(component.bookingForm.get('agreeToTerms')).toBeDefined();
  });

  it('should calculate payment amount from amenity', () => {
    component.ngOnInit();
    expect(component.paymentAmount).toBe(50);
  });

  it('should format time slot correctly', () => {
    const formatted = component.formatTimeSlot();
    expect(formatted).toContain('8:00');
    expect(formatted).toContain('10:00');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-05-15');
    expect(formatted).toContain('May');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should validate file on selection', async () => {
    const mockFile = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    });
    spyOn(fileUploadService, 'validateFile').and.returnValue({ valid: true });
    spyOn(fileUploadService, 'createFilePreview').and.returnValue(
      Promise.resolve({
        file: mockFile,
        preview: 'data:application/pdf;base64,...',
        fileName: 'test.pdf',
        fileSize: '100 KB',
        fileType: 'PDF Document',
      })
    );

    const event = {
      target: {
        files: [mockFile],
      },
    } as any;

    await component.onFileSelected(event);

    expect(component.selectedFile).toBeDefined();
    expect(component.selectedFile?.fileName).toBe('test.pdf');
  });

  it('should remove selected file', () => {
    component.selectedFile = {
      file: new File([''], 'test.pdf'),
      preview: 'data:...',
      fileName: 'test.pdf',
      fileSize: '100 KB',
      fileType: 'PDF',
    };

    component.removeFile();

    expect(component.selectedFile).toBeNull();
    expect(component.bookingForm.get('attachmentFile')?.value).toBeNull();
  });

  it('should detect image file type', () => {
    component.selectedFile = {
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,...',
      fileName: 'test.jpg',
      fileSize: '500 KB',
      fileType: 'Image',
    };

    expect(component.isImagePreview()).toBe(true);
    expect(component.isPdfPreview()).toBe(false);
  });

  it('should detect PDF file type', () => {
    component.selectedFile = {
      file: new File([''], 'test.pdf', { type: 'application/pdf' }),
      preview: 'data:application/pdf;base64,...',
      fileName: 'test.pdf',
      fileSize: '100 KB',
      fileType: 'PDF Document',
    };

    expect(component.isPdfPreview()).toBe(true);
    expect(component.isImagePreview()).toBe(false);
  });

  it('should submit booking successfully', async () => {
    component.ngOnInit();
    component.selectedFile = {
      file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
      preview: 'data:application/pdf;base64,...',
      fileName: 'test.pdf',
      fileSize: '100 KB',
      fileType: 'PDF Document',
    };
    component.bookingForm.patchValue({
      attachmentFile: component.selectedFile.file,
      agreeToTerms: true,
    });

    const mockBooking = {
      id: 'booking-1',
      amenityId: 'test-amenity',
      tenantId: 'tenant-1',
      tenantName: 'Test User',
      date: '2024-05-15',
      startTime: '08:00',
      endTime: '10:00',
      status: 'PENDING' as const,
    };

    spyOn(amenityBookingService, 'createBookingWithAttachment').and.returnValue(
      of(mockBooking)
    );
    spyOn(amenityBookingService, 'refreshBookings');
    spyOn(router, 'navigate');
    spyOn(loadingController, 'create').and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        dismiss: () => Promise.resolve(true),
      } as any)
    );

    await component.submitBooking();

    expect(amenityBookingService.createBookingWithAttachment).toHaveBeenCalled();
    expect(amenityBookingService.refreshBookings).toHaveBeenCalled();
  });

  it('should handle booking submission error', async () => {
    component.ngOnInit();
    component.selectedFile = {
      file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
      preview: 'data:application/pdf;base64,...',
      fileName: 'test.pdf',
      fileSize: '100 KB',
      fileType: 'PDF Document',
    };
    component.bookingForm.patchValue({
      attachmentFile: component.selectedFile.file,
      agreeToTerms: true,
    });

    spyOn(amenityBookingService, 'createBookingWithAttachment').and.returnValue(
      throwError(() => new Error('API Error'))
    );
    spyOn(loadingController, 'create').and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        dismiss: () => Promise.resolve(true),
      } as any)
    );

    await component.submitBooking();

    expect(component.isSubmitting).toBe(false);
  });

  it('should navigate back on cancel', () => {
    spyOn(router, 'navigate');
    component.cancelBooking();
    expect(router.navigate).toHaveBeenCalledWith([
      '/main/community-living/book-amenity',
    ]);
  });

  it('should validate form before submission', async () => {
    component.ngOnInit();
    component.bookingForm.patchValue({
      attachmentFile: null,
      agreeToTerms: false,
    });

    spyOn(component as any, 'showErrorToast');

    await component.submitBooking();

    expect(component.isSubmitting).toBe(false);
  });
});
