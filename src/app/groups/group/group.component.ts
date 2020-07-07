// Angular
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Models
import { GeographicalExtentID } from 'src/app/models/enums';
import { Group } from 'src/app/models/group.model';
import { SubGroup } from 'src/app/models/sub-group.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { GroupsService } from 'src/app/services/groups.service';


@Component({
  selector: 'app-group',
  templateUrl: 'group.component.html',
  styleUrls: ['group.component.css']
})
export class GroupComponent implements OnInit, OnDestroy {

  @Input() GroupDisplay: Group;
  @Input() GroupCount: number;
  @Output() Refresh = new EventEmitter();

  public GeographicalExtentID = GeographicalExtentID;

  groupCopy: Group;
  groupEdit = false;
  membershipMessage = '';

  newSubGroupTemplate: SubGroup;
  creatingNewSubGroup = false;

  error: string;

  get showCountries(): boolean {
    return this.appData.ShowCountries(this.GroupDisplay.geographicalExtentID);
  }

  get showRegions(): boolean {
    return this.appData.ShowRegions(this.GroupDisplay.geographicalExtentID);
  }

  get showCities(): boolean {
    return this.appData.ShowCities(this.GroupDisplay.geographicalExtentID);
  }

  issuesLink(subGroup: string): string {
    return `/group/${this.appData.kebab(this.GroupDisplay.groupName)}/${this.appData.kebab(subGroup)}`;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private appData: AppDataService,
    private groupsService: GroupsService
  ) { }

  ngOnInit(): void {
    this.getGroup();
  }

  getGroup() {

    let groupName = this.activatedRoute.snapshot.params['groupName'];
    groupName = this.appData.unKebab(groupName);

    this.groupsService.Group(groupName, true).subscribe(
      {
        next: (group: Group) => {
          this.GroupDisplay = group;
        },
        error: serverError => {
          this.error = serverError.error.detail;
        }
      }
    );
  }

  Join() {

    this.error = '';
    this.membershipMessage = '';

    this.groupsService.Join(this.GroupDisplay.groupID).subscribe(
      {
        next: members => {
          this.GroupDisplay.groupMember = true;
          this.GroupDisplay.members = members;
          this.membershipMessage = 'you have joined the group';
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  Leave() {

    this.error = '';
    this.membershipMessage = '';

    this.groupsService.Leave(this.GroupDisplay.groupID).subscribe(
      {
        next: members => {
          this.GroupDisplay.groupMember = false;
          this.GroupDisplay.members = members;
          this.membershipMessage = 'you have left the group';
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  Activate() {

    this.error = '';

    this.groupsService.Activate(this.GroupDisplay.groupID, true).subscribe(
      {
        next: _ => this.GroupDisplay.active = true,
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  DeActivate() {

    this.error = '';

    this.groupsService.Activate(this.GroupDisplay.groupID, false).subscribe(
      {
        next: _ => this.GroupDisplay.active = false,
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  Edit() {
    this.groupCopy = <Group>this.appData.deep(this.GroupDisplay); // If we decide to cancel
    this.groupEdit = true;
  }

  Delete() {
    if (confirm(`Are you sure you wish to permanently delete this group?
This cannot be undone.`)) {
      this.groupsService.Delete(this.GroupDisplay.groupID)
        .subscribe(
          {
            next: _ => this.Refresh.emit(),
            error: serverError => this.error = serverError.error.detail
          }
        );
    }
  }

  Cancel() {
    this.GroupDisplay = <Group>this.appData.deep(this.groupCopy);
    this.groupEdit = false;
  }

  Complete(group: Group) {
    this.GroupDisplay = group;
    this.groupEdit = false;
  }

  newSubGroup() {
    this.newSubGroupTemplate = new SubGroup();
    this.newSubGroupTemplate.groupID = this.GroupDisplay.groupID;
    this.creatingNewSubGroup = true;
  }


  newSubgroupCreated(newSubGroup: string) {
    this.creatingNewSubGroup = false;
    this.getGroup();
  }


  ngOnDestroy() {

  }
}
