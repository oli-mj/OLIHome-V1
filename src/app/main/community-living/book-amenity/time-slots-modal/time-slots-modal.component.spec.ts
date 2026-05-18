import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSlotsModalComponent } from './time-slots-modal.component';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';

describe('TimeSlotsModalComponent', () => {
  let component: TimeSlotsModalComponent;
  let fixture: ComponentFixture<TimeSlotsModalComponent>;
  let modalController: ModalController;
  let toastController: ToastController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeSlotsModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [ModalController, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotsModalComponent);
    component = fixture.componentInstance;
    component.amenityId = 'test-amenity-id';
    component.selectedDate = '2024-05-15';
    modalController = TestBed.inject(ModalController);
    toastController = TestBed.inject(ToastController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format time slot correctly', () => {
    const slot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: false,
    };

    const formatted = component.formatTimeSlot(slot);
    expect(formatted).toContain('8:00');
    expect(formatted).toContain('10:00');
  });

  it('should return correct status chip for available slot', () => {
    const slot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: false,
    };

    const status = component.getStatusChip(slot);
    expect(status.text).toBe('Available');
    expect(status.color).toBe('success');
  });

  it('should return correct status chip for booked slot', () => {
    const slot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: true,
      booking: {
        id: 'booking-1',
        amenityId: 'amenity-1',
        date: '2024-05-15',
        timeSlotId: '1',
        tenantId: 'tenant-1',
        tenantName: 'John Doe',
        status: 'confirmed',
      },
    };

    const status = component.getStatusChip(slot);
    expect(status.text).toBe('Booked');
    expect(status.color).toBe('danger');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-05-15');
    expect(formatted).toContain('May');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should emit slotSelected event on confirmation', (done) => {
    const slot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: false,
    };

    component.selectedSlot = slot;
    component.slotSelected.subscribe((selected) => {
      expect(selected.id).toBe('1');
      done();
    });

    spyOn(component, 'closeModal');
    component.confirmSelection();
  });

  it('should check if slot is selectable', () => {
    const availableSlot = {
      id: '1',
      startTime: '08:00',
      endTime: '10:00',
      isBooked: false,
    };

    const bookedSlot = {
      id: '2',
      startTime: '10:00',
      endTime: '12:00',
      isBooked: true,
    };

    expect(component.isSelectableSlot(availableSlot)).toBe(true);
    expect(component.isSelectableSlot(bookedSlot)).toBe(false);
  });
});
