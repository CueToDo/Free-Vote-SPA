import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostOfTheWeekComponent } from './post-of-the-week.component';

describe('PostOfTheWeekComponent', () => {
  let component: PostOfTheWeekComponent;
  let fixture: ComponentFixture<PostOfTheWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostOfTheWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostOfTheWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
