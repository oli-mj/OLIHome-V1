import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataPrivacyPolicyPageRoutingModule } from './data-privacy-policy-routing.module';
import { DataPrivacyPolicyPage } from './data-privacy-policy.page';
import { AppHeaderComponent } from '../shared/components/app-header/app-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DataPrivacyPolicyPageRoutingModule,
    AppHeaderComponent
  ],
  declarations: [DataPrivacyPolicyPage]
})
export class DataPrivacyPolicyPageModule { }
