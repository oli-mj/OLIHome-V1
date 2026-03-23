import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandbookPage } from './handbook.page';

describe('HandbookPage', () => {
  let component: HandbookPage;
  let fixture: ComponentFixture<HandbookPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HandbookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
