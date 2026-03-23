import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookAmenityPage } from './book-amenity.page';

describe('BookAmenityPage', () => {
  let component: BookAmenityPage;
  let fixture: ComponentFixture<BookAmenityPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookAmenityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
