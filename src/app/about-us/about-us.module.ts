import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AboutUsPageRoutingModule } from './about-us-routing.module'
import { AboutUsPage } from './about-us.page';
import { AppHeaderComponent } from '../shared/components/app-header/app-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutUsPageRoutingModule,
    AppHeaderComponent
  ],
  declarations: [AboutUsPage]
})
export class AboutUsPageModule { }
