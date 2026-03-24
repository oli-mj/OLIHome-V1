import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FileATicketPageRoutingModule } from './file-a-ticket-routing.module';

import { FileATicketPage } from './file-a-ticket.page';
import { TicketDetailModalComponent } from './components/ticket-detail-modal/ticket-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FileATicketPageRoutingModule
  ],
  declarations: [FileATicketPage, TicketDetailModalComponent]
})
export class FileATicketPageModule {}
