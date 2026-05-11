import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ticket } from '../../file-a-ticket.page';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-ticket-detail-modal',
  templateUrl: './ticket-detail-modal.component.html',
  styleUrls: ['./ticket-detail-modal.component.scss'],
  standalone: false
})
export class TicketDetailModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private authService = inject(AuthService);

  @Input() ticket!: Ticket;
  
  userName: string = '';
  userEmail: string = '';

  async ngOnInit() {
    const userData = await this.authService.getUserData();
    if (userData) {
      this.userName = userData.name;
      this.userEmail = userData.email;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
