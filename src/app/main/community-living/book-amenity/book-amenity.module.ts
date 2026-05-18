import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookAmenityPageRoutingModule } from './book-amenity-routing.module';
import { BookAmenityPage } from './book-amenity.page';
import { AvailabilityCalendarComponent } from './availability-calendar/availability-calendar.component';
import { TimeSlotsModalComponent } from './time-slots-modal/time-slots-modal.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingHistoryComponent } from './booking-history/booking-history.component';
import { BookingDetailModalComponent } from './booking-detail-modal/booking-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BookAmenityPageRoutingModule,
  ],
  declarations: [
    BookAmenityPage,
    AvailabilityCalendarComponent,
    TimeSlotsModalComponent,
    BookingFormComponent,
    BookingHistoryComponent,
    BookingDetailModalComponent,
  ],
})
export class BookAmenityPageModule {}
