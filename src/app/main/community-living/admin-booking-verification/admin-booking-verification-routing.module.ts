import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminBookingVerificationComponent } from './admin-booking-verification.component';
import { adminGuard } from '../../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminBookingVerificationComponent,
    canActivate: [adminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminBookingVerificationRoutingModule {}
