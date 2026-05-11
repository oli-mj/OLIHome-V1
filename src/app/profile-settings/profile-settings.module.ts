import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfileSettingsPageRoutingModule } from './profile-settings-routing.module';
import { ProfileSettingsPage } from './profile-settings.page';
import { AppHeaderComponent } from '../shared/components/app-header/app-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileSettingsPageRoutingModule,
    AppHeaderComponent
  ],
  declarations: [ProfileSettingsPage]
})
export class ProfileSettingsPageModule { }
