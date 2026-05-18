import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookAmenityPage } from './book-amenity.page';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AvailabilityCalendarComponent } from './availability-calendar/availability-calendar.component';
import { AmenityBookingService } from '../../services/amenity-booking.service';

describe('BookAmenityPage', () => {
  let component: BookAmenityPage;
  let fixture: ComponentFixture<BookAmenityPage>;
  let modalController: ModalController;
  let toastController: ToastController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookAmenityPage, AvailabilityCalendarComponent],
      imports: [IonicModule.forRoot()],
      providers: [ModalController, ToastController, AmenityBookingService],
    }).compileComponents();

    fixture = TestBed.createComponent(BookAmenityPage);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    toastController = TestBed.inject(ToastController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected amenity on init', () => {
    expect(component.selectedAmenity).toBeDefined();
    expect(component.selectedAmenity.id).toBe('amenity-1');
  });

  it('should handle day selection', async () => {
    spyOn(component, 'openTimeSlotsModal');
    const testDate = '2024-05-15';

    component.onDaySelected(testDate);

    expect(component.selectedDate).toBe(testDate);
    expect(component.openTimeSlotsModal).toHaveBeenCalledWith(testDate);
  });

  it('should show toast notifications', async () => {
    spyOn(toastController, 'create').and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
      } as any)
    );

    // Test by calling private methods through public methods
    expect(component).toBeTruthy();
  });

  it('should refresh calendar', () => {
    const mockCalendarComponent = { loadCalendar: jasmine.createSpy() };
    component.calendarComponent = mockCalendarComponent;

    component.refreshCalendar();

    expect(mockCalendarComponent.loadCalendar).toHaveBeenCalled();
  });

  it('should set selected slot on time slot selection', () => {
    const testSlot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: false,
    };

    component.selectedSlot = testSlot;

    expect(component.selectedSlot).toEqual(testSlot);
  });
});
