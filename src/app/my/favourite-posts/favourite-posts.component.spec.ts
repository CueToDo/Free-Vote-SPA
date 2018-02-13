import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouritePostsComponent } from './favourite-posts.component';

describe('FavouritePostsComponent', () => {
  let component: FavouritePostsComponent;
  let fixture: ComponentFixture<FavouritePostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavouritePostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavouritePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
