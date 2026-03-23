import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommunityLivingPageRoutingModule } from './community-living-routing.module';

import { CommunityLivingPage } from './community-living.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommunityLivingPageRoutingModule
  ],
  declarations: [CommunityLivingPage]
})
export class CommunityLivingPageModule {}
