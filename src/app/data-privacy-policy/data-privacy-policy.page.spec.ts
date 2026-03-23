import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPrivacyPolicyPage } from './data-privacy-policy.page';

describe('DataPrivacyPolicyPage', () => {
  let component: DataPrivacyPolicyPage;
  let fixture: ComponentFixture<DataPrivacyPolicyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPrivacyPolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
