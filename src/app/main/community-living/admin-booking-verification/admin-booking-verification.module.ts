import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminBookingVerificationRoutingModule } from './admin-booking-verification-routing.module';
import { AdminBookingVerificationComponent } from './admin-booking-verification.component';
import { BookingVerificationDetailModalComponent } from './booking-verification-detail-modal/booking-verification-detail-modal.component';

@NgModule({
  declarations: [AdminBookingVerificationComponent, BookingVerificationDetailModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminBookingVerificationRoutingModule,
  ],
})
export class AdminBookingVerificationModule {}
