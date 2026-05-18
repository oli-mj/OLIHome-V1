import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookAmenityPage } from './book-amenity.page';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingHistoryComponent } from './booking-history/booking-history.component';

const routes: Routes = [
  {
    path: '',
    component: BookAmenityPage
  },
  {
    path: 'booking-form',
    component: BookingFormComponent
  },
  {
    path: 'history',
    component: BookingHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookAmenityPageRoutingModule {}
