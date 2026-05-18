import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailabilityCalendarComponent } from './availability-calendar.component';
import { IonicModule } from '@ionic/angular';

describe('AvailabilityCalendarComponent', () => {
  let component: AvailabilityCalendarComponent;
  let fixture: ComponentFixture<AvailabilityCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityCalendarComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityCalendarComponent);
    component = fixture.componentInstance;
    component.amenityId = 'test-amenity-id';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate calendar days for the current month', () => {
    component.ngOnInit();
    expect(component.calendarDays.length).toBeGreaterThan(0);
  });

  it('should emit daySelected event when a day is clicked', (done) => {
    component.currentYear = 2024;
    component.currentMonth = 5;
    component.monthAvailability['2024-05-15'] = {
      date: '2024-05-15',
      totalSlots: 8,
      availableSlots: 3,
      bookedSlots: 5,
      status: 'partially-booked',
    };

    component.daySelected.subscribe((date) => {
      expect(date).toBe('2024-05-15');
      done();
    });

    component.onDayClick(15);
  });

  it('should navigate to next month', () => {
    const initialMonth = component.currentMonth;
    const initialYear = component.currentYear;

    component.nextMonth();

    if (initialMonth === 12) {
      expect(component.currentMonth).toBe(1);
      expect(component.currentYear).toBe(initialYear + 1);
    } else {
      expect(component.currentMonth).toBe(initialMonth + 1);
      expect(component.currentYear).toBe(initialYear);
    }
  });

  it('should navigate to previous month', () => {
    const initialMonth = component.currentMonth;
    const initialYear = component.currentYear;

    component.previousMonth();

    if (initialMonth === 1) {
      expect(component.currentMonth).toBe(12);
      expect(component.currentYear).toBe(initialYear - 1);
    } else {
      expect(component.currentMonth).toBe(initialMonth - 1);
      expect(component.currentYear).toBe(initialYear);
    }
  });

  it('should return correct CSS class for day status', () => {
    component.monthAvailability['2024-05-15'] = {
      date: '2024-05-15',
      totalSlots: 8,
      availableSlots: 5,
      bookedSlots: 3,
      status: 'partially-booked',
    };

    expect(component.getDayStatusClass(15)).toBe('day-partially-booked');
  });
});
