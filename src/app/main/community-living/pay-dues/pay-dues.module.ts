import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayDuesPageRoutingModule } from './pay-dues-routing.module';

import { PayDuesPage } from './pay-dues.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayDuesPageRoutingModule
  ],
  declarations: [PayDuesPage]
})
export class PayDuesPageModule {}
