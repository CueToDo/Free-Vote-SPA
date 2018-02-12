import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMembershipComponent } from './group-membership.component';

describe('GroupMembershipComponent', () => {
  let component: GroupMembershipComponent;
  let fixture: ComponentFixture<GroupMembershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupMembershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
