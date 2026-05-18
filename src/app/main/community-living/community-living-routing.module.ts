import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommunityLivingPage } from './community-living.page';
import { adminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: CommunityLivingPage
  },
  {
    path: 'book-amenity',
    loadChildren: () => import('./book-amenity/book-amenity.module').then( m => m.BookAmenityPageModule)
  },
  {
    path: 'pay-dues',
    loadChildren: () => import('./pay-dues/pay-dues.module').then( m => m.PayDuesPageModule)
  },
  {
    path: 'handbook',
    loadChildren: () => import('./handbook/handbook.module').then( m => m.HandbookPageModule)
  },
  {
    path: 'announcements',
    loadChildren: () => import('./announcements/announcements.module').then( m => m.AnnouncementsPageModule)
  },
  {
    path: 'admin/verify-bookings',
    loadChildren: () => import('./admin-booking-verification/admin-booking-verification.module').then( m => m.AdminBookingVerificationModule),
    canActivate: [adminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityLivingPageRoutingModule {}
