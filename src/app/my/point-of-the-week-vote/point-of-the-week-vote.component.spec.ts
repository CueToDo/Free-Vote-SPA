import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointOfTheWeekVoteComponent } from './point-of-the-week-vote.component';

describe('PointOfTheWeekVoteComponent', () => {
  let component: PointOfTheWeekVoteComponent;
  let fixture: ComponentFixture<PointOfTheWeekVoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointOfTheWeekVoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointOfTheWeekVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
