// Angular
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// rxjs

// Services
import { AppDataService } from '../../services/app-data.service';
import { OrganisationsService } from 'src/app/services/groups.service';

// Models and Enums
import { GroupDecisionBasisOption } from '../../models/enums';
import { SubGroup, SubGroupUpdate } from 'src/app/models/sub-group.model';

@Component({
  selector: 'app-sub-group-edit',
  templateUrl: './sub-group-edit.component.html',
  styleUrls: ['./sub-group-edit.component.css']
})
export class SubGroupEditComponent implements OnInit, OnDestroy {

  @Input() subGroup: SubGroup;
  @Output() subGroupChange = new EventEmitter(); // Still need to emit

  @Output() complete = new EventEmitter();
  @Output() cancelled = new EventEmitter();

  @ViewChild('subGroupName', { static: true }) elSubGroupName: ElementRef;

  subGroupCopy: SubGroup;

  saving = false;
  error = '';

  constructor(
    private appData: AppDataService,
    private groupsService: OrganisationsService
  ) { }

  ngOnInit(): void {
    this.subGroupCopy = this.appData.deep(this.subGroup) as SubGroup;
    this.elSubGroupName.nativeElement.focus();
    if (!this.subGroup.subGroupID || this.subGroup.subGroupID < 1) {
      this.subGroup.decisionBasisOptionID = GroupDecisionBasisOption.SimpleMajority.toString();
    }
  }

  superMajorityCheck(): boolean {

    this.error = '';

    if (this.subGroup.decisionBasisOptionID !== GroupDecisionBasisOption.SuperMajority.toString()) {
      return true;
    } else if (this.subGroup.superMajority < 52 || this.subGroup.superMajority > 99) {
      this.error = 'super majority must be a value between 52 and 99';
      return false;
    } else {
      return true;
    }
  }

  update() {

    if (this.appData.isUrlNameUnSafe(this.subGroup.subGroupName)) {
      if (confirm('Sub Group name contains invalid characters. Remove them now?')) {
        this.subGroup.subGroupName = this.appData.urlSafeName(this.subGroup.subGroupName);
      } else {
        return;
      }
    }

    if (this.superMajorityCheck()) {

      this.saving = true;
      this.error = '';

      this.groupsService.GroupUpdate(this.subGroup as SubGroupUpdate).subscribe(
        {
          next: subGroup => {
            this.subGroup = this.appData.deep(subGroup) as SubGroup;
            this.subGroupChange.emit(this.subGroup);
            this.complete.emit(this.subGroup.subGroupName);
          },
          error: serverError => {
            this.error = serverError.error.detail;
            this.saving = false;
          },
          complete: () => this.saving = false // error means complete!
        }
      );
    }
  }

  cancel() {
    this.subGroup = this.appData.deep(this.subGroupCopy) as SubGroup;
    this.subGroupChange.emit(this.subGroup);
    this.cancelled.emit();
  }

  ngOnDestroy() {

  }
}
