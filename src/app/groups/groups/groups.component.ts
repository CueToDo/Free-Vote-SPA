import { GroupEditComponent } from 'src/app/groups/group-edit/group-edit.component';
// Angular
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Model
import { Group } from 'src/app/models/group.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';

// Components
import { GroupListComponent } from 'src/app/groups//group-list/group-list.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, AfterViewInit {

  @ViewChild('GroupMembership') groupMembership: GroupListComponent;
  @ViewChild('GroupsAvailable') groupsAvailable: GroupListComponent;
  @ViewChild('NewGroupComponent') newGroupComponent: GroupEditComponent;

  public tabIndex = 0;
  private tabSelected: string;
  public NewGroup: Group;

  constructor(private activatedRoute: ActivatedRoute,
    private appDataService: AppDataService) {

  }

  ngOnInit() {

    this.tabSelected = this.activatedRoute.snapshot.params['tab'];

    if (!this.tabSelected) {
      this.tabSelected = 'membership';
    }

    switch (this.tabSelected) {
      case 'membership':
        this.tabIndex = 0;
        break;
      case 'other':
        this.tabIndex = 1;
        break;
    }

    this.StartNewGroup();

  }

  ngAfterViewInit() {
    this.groupMembership.Refresh();
    this.newGroupComponent.ClearError();
  }

  ChangeTab(tabIndex: number) {

    this.tabIndex = tabIndex;

    switch (tabIndex) {
      case 0:
        this.groupMembership.Refresh();
        this.appDataService.RouteParamChange$.next('/groups/membership');
        break;
      case 1:
        this.groupsAvailable.Refresh();
        this.appDataService.RouteParamChange$.next('/groups/available');
        break;
      case 2:
        this.StartNewGroup();
        this.newGroupComponent.ClearError();
        this.appDataService.RouteParamChange$.next('/groups/new');
        break;
    }

  }

  CancelNew() {
    this.ChangeTab(0);
  }

  CompleteNew() {
    this.ChangeTab(0);
  }

  StartNewGroup() {
    this.NewGroup = new Group();
    this.NewGroup.countries = ['UK'];
  }
}
