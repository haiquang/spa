import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavitationBarComponent } from './navitation-bar.component';

describe('NavitationBarComponent', () => {
  let component: NavitationBarComponent;
  let fixture: ComponentFixture<NavitationBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavitationBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavitationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
