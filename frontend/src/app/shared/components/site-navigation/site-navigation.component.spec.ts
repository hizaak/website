import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteNavigationComponent } from './site-navigation.component';

describe('SiteNavigationComponent', () => {
  let component: SiteNavigationComponent;
  let fixture: ComponentFixture<SiteNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
