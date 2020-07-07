
// Angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Model
import { SubGroup } from 'src/app/models/sub-group.model';
import { Issue } from 'src/app/models/issue.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { GroupsService } from 'src/app/services/groups.service';
import { IssuesService } from 'src/app/services/issues.service';


@Component({
  selector: 'app-sub-groups',
  templateUrl: './sub-groups.component.html',
  styleUrls: ['./sub-groups.component.css']
})
export class SubGroupsComponent implements OnInit, OnDestroy {

  groupName: string;
  groupID: number;

  subGroups: SubGroup[];
  subGroupsFiltered: SubGroup[];
  subGroupSelected: string;
  newSubGroupTemplate: SubGroup;
  creatingNewSubGroup = false;

  error: string;

  constructor(
    private activeRoute: ActivatedRoute,
    public appData: AppDataService,
    private groupsService: GroupsService
  ) { }

  ngOnInit(): void {

    const routeParams = this.activeRoute.snapshot.params;
    this.groupName = this.appData.unKebab(routeParams.groupName);
    this.groupID = this.groupsService.GroupID(this.groupName);
    this.subGroupSelected = this.appData.unKebab(routeParams.subGroupName);

    this.getSubGroups();
  }

  getSubGroups() {

    this.error = '';

    this.groupsService.SubGroups(this.groupID).subscribe(
      {
        next: subGroups => {
          this.subGroups = subGroups as SubGroup[];
          // this.SelectSubGroup();
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  // SelectSubGroup() {
  //   this.subGroupsFiltered = this.subGroups.filter(subGroup => subGroup['subGroupName'] === this.subGroupSelected);
  // }



  subGroupUpdated() {
    this.getSubGroups();
    this.creatingNewSubGroup = false;
  }

  newSubgroupCreated(newSubGroup: string) {
    this.subGroupSelected = newSubGroup;
    this.subGroupUpdated();
  }

  subGroupDeleted() {
    this.getSubGroups(); // could just remove from local subGroups array
    if (this.subGroups.length > 0) {
      this.subGroupSelected = this.subGroups[0].subGroupName;
    }
  }

  get subGroupID(): number {
    return this.subGroupsFiltered[0].subGroupID;
  }

  ngOnDestroy() {

  }

}
