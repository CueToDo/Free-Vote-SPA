import { GroupEditComponent } from 'src/app/groups/group-edit/group-edit.component';
// Angular
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Model
import { Organisation } from 'src/app/models/group.model';

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
  public NewOrganisation: Organisation;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appDataService: AppDataService) {

  }

  ngOnInit() {

    this.StartNewGroup(); // For GroupEdit, do this early

    // tab is not a route parameter, but a route segment
    // this.tabSelected = this.activatedRoute.snapshot.params['tab'];

    // https://stackoverflow.com/questions/49684409/how-to-get-angular-5-route-segments-from-activatedroute
    this.tabSelected = this.activatedRoute.snapshot.url[0].path;

    if (!this.tabSelected) {
      this.tabSelected = 'membership';
    }

    switch (this.tabSelected) {
      case 'membership':
        this.tabIndex = 0;
        break;
      case 'available':
        this.tabIndex = 1;
        break;
      case 'new':
        this.tabIndex = 2;
        break;
    }

  }

  ngAfterViewInit() {
    this.groupMembership.Refresh();
    this.groupsAvailable.Refresh();
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

  CompleteNew(group: Organisation) {
    this.router.navigate(['/groups', group.organisationName]);
  }

  StartNewGroup() {
    this.NewOrganisation = new Organisation();
    this.NewOrganisation.countries = ['UK'];
  }
}
