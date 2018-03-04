import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointOfTheWeekComponent } from './point-of-the-week.component';

describe('PointOfTheWeekComponent', () => {
  let component: PointOfTheWeekComponent;
  let fixture: ComponentFixture<PointOfTheWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointOfTheWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointOfTheWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
