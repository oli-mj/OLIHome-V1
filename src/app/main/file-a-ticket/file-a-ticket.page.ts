import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-file-a-ticket',
  templateUrl: './file-a-ticket.page.html',
  styleUrls: ['./file-a-ticket.page.scss'],
  standalone: false,
})
export class FileATicketPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  activeSegment: string = 'my-tickets';
  activeFilter: string = 'All';

  selectedFiles: File[] = [];
  isDragging = false;

  constructor() { }

  ngOnInit() { }

  onSegmentChange(event: any) {
    this.activeSegment = event.detail.value;
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

}
