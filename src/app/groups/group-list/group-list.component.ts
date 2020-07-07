
// Angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Model
import { Group } from 'src/app/models/group.model';

// Services
import { AppDataService } from './../../services/app-data.service';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit, OnDestroy {

  @Input() CurrentMembership: boolean;

  public groups: Group[];
  public groupCount: number;
  public groupFilter = '';
  public waiting = false;
  public message = '';
  public error = '';

  constructor(
    public appData: AppDataService,
    private groupsService: GroupsService
  ) { }

  ngOnInit() {
  }

  @Input() Refresh() {

    this.groups = [];
    this.waiting = true;
    this.message = '';
    this.error = '';

    if (this.CurrentMembership) {
      this.groupsService.GroupMembership(this.groupFilter)
        .subscribe(
          {
            next: groups => {
              this.groups = groups;
              this.groupCount = groups.length;
              if (this.groupCount === 0) {
                if (this.groupFilter) {
                  this.message = 'You are not a member of any groups that match the search';
                } else {
                  this.message = 'You are not a member of any groups';
                }
              }
            },
            error: serverError => this.error = serverError.error.detail,
            complete: () => this.waiting = false
          }
        );
    } else {
      this.groupsService.GroupsAvailable(this.groupFilter)
        .subscribe(
          {
            next: groups => {
              this.groups = groups;
              this.groupCount = groups.length;
              if (this.groupCount === 0) {
                if (this.groupFilter) {
                  this.message = 'No groups are available to join that match the search';
                } else {
                  this.message = 'No more groups are available to join';
                }
              }
            },
            error: serverError => this.error = serverError.error.detail,
            complete: () => this.waiting = false
          }
        );
    }
  }

  ngOnDestroy() {

  }
}
