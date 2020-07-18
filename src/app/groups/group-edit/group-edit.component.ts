
// Angular
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatSelect } from '@angular/material/select';

// rxjs
import { Subscription } from 'rxjs';

// Model
import { Kvp } from 'src/app/models/kvp.model';
import { GeographicalExtent, GeographicalExtentID } from 'src/app/models/enums';
import { Group } from 'src/app/models/group.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.css']
})
export class GroupEditComponent implements OnInit, OnDestroy {

  @Input() group: Group;

  @Output() Cancel = new EventEmitter();
  @Output() Complete = new EventEmitter<Group>();

  @ViewChild('groupName', { static: true }) elGroupName: ElementRef;
  @ViewChild('groupDescription', { static: true }) elGroupDescription: ElementRef;
  @ViewChild('groupWebsite', { static: true }) elGroupWebsite: ElementRef;
  @ViewChild('geoExtent', { static: true }) elGeoExtent: MatSelect;


  private groups$: Subscription;
  private extents$: Subscription;

  public GeographicalExtentID = GeographicalExtentID;
  public GeographicalExtent = GeographicalExtent;

  extents: Kvp[];

  get showCountries(): boolean {
    return this.appData.ShowCountries(this.group.geographicalExtentID);
  }

  get showRegions(): boolean {
    return this.appData.ShowRegions(this.group.geographicalExtentID);
  }

  get showCities(): boolean {
    return this.appData.ShowCities(this.group.geographicalExtentID);
  }

  get saveDescription() { return this.group.groupID > 0 ? 'update' : 'save'; }
  error = '';

  constructor(
    private appData: AppDataService,
    private groupsService: GroupsService
  ) { }

  ngOnInit(): void {

    this.extents$ = this.appData.GeographicalExtents().subscribe(
      {
        next: extents => this.extents = extents,
        error: serverError => this.error = serverError.error.detail
      }
    );

  }

  public ClearError() {
    this.error = '';
    this.elGroupName.nativeElement.focus();
  }

  nameComplete() {
    this.elGroupDescription.nativeElement.focus();
  }

  descriptionComplete() {
    this.elGroupWebsite.nativeElement.focus();
  }

  websiteComplete() {
    this.elGeoExtent.focus();
  }

  extentSelected(extent: string) {
    // NB: Value from a drop down will be a string
    // extent is a string, even if we did type it as a number
    this.group.geographicalExtent = GeographicalExtent.get(extent);
  }

  Update() {

    if (this.appData.isUrlNameUnSafe(this.group.groupName)) {
      if (confirm('Sub Group name contains invalid characters. Remove them now?')) {
        this.group.groupName = this.appData.urlSafeName(this.group.groupName);
      } else {
        return;
      }
    }

    this.error = '';
    const newGroup = this.group.groupID < 1;

    this.groups$ = this.groupsService.Update(this.group)
      .subscribe(
        {
          next: group => {
            this.Complete.emit(group);
            if (newGroup) {
              this.group = new Group();
              this.group.geographicalExtentID = GeographicalExtentID.National.toString();
            }
          },
          error: serverError => {
            this.error = serverError.error.detail;
          }
        }
      );

  }

  CancelEdit() {
    this.Cancel.emit();
  }

  ngOnDestroy() {
    if (this.groups$) { this.groups$.unsubscribe(); }
    if (this.extents$) { this.extents$.unsubscribe(); }
  }

}
