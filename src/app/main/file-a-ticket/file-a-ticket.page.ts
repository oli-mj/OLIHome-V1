import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { ModalController, SegmentChangeEventDetail } from '@ionic/angular';
import { TicketDetailModalComponent } from './components/ticket-detail-modal/ticket-detail-modal.component';
import { Ticket } from '../../models/ticket.model';
import { TopicMap } from '../../models/common.model';
import { TICKET_STATUS } from '../../constants/app.constants';

@Component({
  selector: 'app-file-a-ticket',
  templateUrl: './file-a-ticket.page.html',
  styleUrls: ['./file-a-ticket.page.scss'],
  standalone: false,
})
export class FileATicketPage {
  private modalCtrl = inject(ModalController);


  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  activeSegment: string = 'my-tickets';
  activeFilter: string = 'All';

  tickets: Ticket[] = [];

  selectedFiles: File[] = [];
  isDragging = false;

  newTicketType: string = '';
  newTicketTopic: string = '';
  newTicketDesc: string = '';
  privacyChecked: boolean = false;

  get filteredTickets(): Ticket[] {
    if (this.activeFilter === 'All') return this.tickets;
    return this.tickets.filter(t => t.status === this.activeFilter);
  }

  get counts(): { All: number; Pending: number; 'In Progress': number; Resolved: number } {
    return {
      All: this.tickets.length,
      Pending: this.tickets.filter(t => t.status === 'Pending').length,
      'In Progress': this.tickets.filter(t => t.status === 'In Progress').length,
      Resolved: this.tickets.filter(t => t.status === 'Resolved').length
    };
  }



  async viewTicketDetails(ticket: Ticket) {
    const modal = await this.modalCtrl.create({
      component: TicketDetailModalComponent,
      componentProps: {
        ticket: ticket
      },
      cssClass: 'ticket-details-modal'
    });
    return await modal.present();
  }

  onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>): void {
    const value = event.detail.value as string;
    this.activeSegment = value || 'my-tickets';
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  // --- File Upload Logic ---
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = ''; // Reset input to allow reusing the same file
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  addFiles(files: File[]) {
    this.selectedFiles = [...this.selectedFiles, ...files];
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  submitTicket() {
    if (!this.newTicketTopic || !this.newTicketDesc || !this.privacyChecked) return;

    // Convert topics to readable titles
    const topicMap: TopicMap = {
      'maintenance': 'Maintenance Issue',
      'billing': 'Billing Inquiry',
      'amenity': 'Amenity Request',
      'security': 'Security Concern',
      'other': 'Other Request'
    };

    const newTicket: Ticket = {
      id: 'TKT-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      title: topicMap[this.newTicketTopic] || this.newTicketTopic,
      description: this.newTicketDesc,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    };

    // Insert at front of array
    this.tickets.unshift(newTicket);

    // Reset and return to feed
    this.cancelTicket();
  }

  cancelTicket() {
    this.newTicketType = '';
    this.newTicketTopic = '';
    this.newTicketDesc = '';
    this.privacyChecked = false;
    this.selectedFiles = [];
    
    this.activeSegment = 'my-tickets';
    this.activeFilter = 'All';
  }

}
