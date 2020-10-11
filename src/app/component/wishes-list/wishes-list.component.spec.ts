import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishesListComponent } from './wishes-list.component';

describe('WishesListComponent', () => {
  let component: WishesListComponent;
  let fixture: ComponentFixture<WishesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WishesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WishesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
