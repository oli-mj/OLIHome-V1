import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayDuesPage } from './pay-dues.page';

const routes: Routes = [
  {
    path: '',
    component: PayDuesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayDuesPageRoutingModule {}
