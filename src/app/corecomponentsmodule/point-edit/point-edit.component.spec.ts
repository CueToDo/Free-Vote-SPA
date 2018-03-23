import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointEditComponent } from './point-edit.component';

describe('PointEditComponent', () => {
  let component: PointEditComponent;
  let fixture: ComponentFixture<PointEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
