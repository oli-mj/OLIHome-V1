import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayDuesPage } from './pay-dues.page';

describe('PayDuesPage', () => {
  let component: PayDuesPage;
  let fixture: ComponentFixture<PayDuesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PayDuesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
