import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostOfTheWeekVoteComponent } from './post-of-the-week-vote.component';

describe('PostOfTheWeekVoteComponent', () => {
  let component: PostOfTheWeekVoteComponent;
  let fixture: ComponentFixture<PostOfTheWeekVoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostOfTheWeekVoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostOfTheWeekVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
