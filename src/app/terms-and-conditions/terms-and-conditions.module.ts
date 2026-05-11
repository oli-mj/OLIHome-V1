import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsAndConditionsPageRoutingModule } from './terms-and-conditions-routing.module';

import { TermsAndConditionsPage } from './terms-and-conditions.page';
import { AppHeaderComponent } from '../shared/components/app-header/app-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsAndConditionsPageRoutingModule,
    AppHeaderComponent
  ],
  declarations: [TermsAndConditionsPage]
})
export class TermsAndConditionsPageModule {}
