import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookAmenityPage } from './book-amenity.page';

const routes: Routes = [
  {
    path: '',
    component: BookAmenityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookAmenityPageRoutingModule {}
