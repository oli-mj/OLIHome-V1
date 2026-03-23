import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileATicketPage } from './file-a-ticket.page';

describe('FileATicketPage', () => {
  let component: FileATicketPage;
  let fixture: ComponentFixture<FileATicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FileATicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
