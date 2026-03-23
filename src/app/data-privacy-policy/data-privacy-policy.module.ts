import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataPrivacyPolicyPageRoutingModule } from './data-privacy-policy-routing.module';
import { DataPrivacyPolicyPage } from './data-privacy-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DataPrivacyPolicyPageRoutingModule
  ],
  declarations: [DataPrivacyPolicyPage]
})
export class DataPrivacyPolicyPageModule { }
