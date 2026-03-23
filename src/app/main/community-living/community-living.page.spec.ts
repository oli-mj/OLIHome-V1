import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityLivingPage } from './community-living.page';

describe('CommunityLivingPage', () => {
  let component: CommunityLivingPage;
  let fixture: ComponentFixture<CommunityLivingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityLivingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
