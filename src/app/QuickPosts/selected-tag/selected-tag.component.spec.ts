import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTagComponent } from './selected-tag.component';

describe('SelectedTagComponent', () => {
  let component: SelectedTagComponent;
  let fixture: ComponentFixture<SelectedTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
