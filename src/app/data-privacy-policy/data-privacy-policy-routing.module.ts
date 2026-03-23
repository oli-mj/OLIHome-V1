import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataPrivacyPolicyPage } from './data-privacy-policy.page';

const routes: Routes = [
  {
    path: '',
    component: DataPrivacyPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataPrivacyPolicyPageRoutingModule { }
