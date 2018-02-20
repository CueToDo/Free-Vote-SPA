import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingTagsComponent } from './following-tags.component';

describe('SelectedTagsComponent', () => {
  let component: FollowingTagsComponent;
  let fixture: ComponentFixture<FollowingTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FollowingTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowingTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
