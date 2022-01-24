import { BreakOutGroupsService } from 'src/app/services/break-out-groups.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Models
import { BreakoutGroup } from 'src/app/models/break-out-group.model';

@Component({
  selector: 'app-group-discussion',
  templateUrl: './group-discussion.component.html',
  styleUrls: ['./group-discussion.component.css']
})
export class GroupDiscussionComponent implements OnInit {
  @Input() public tagDisplay = '';
  @Input() public bogSelected: BreakoutGroup | undefined;
  @Input() public character = '';
  @Output() SelectAnother = new EventEmitter();

  constructor(private breakoutGroupsService: BreakOutGroupsService) {}

  ngOnInit(): void {}

  selectAnother(): void {
    this.SelectAnother.emit();
  }

  delete(): void {
    if (
      !!this.bogSelected &&
      confirm(
        `Are you sure you wish to delete breakout group ${this.bogSelected?.breakoutRoom} and all comments?`
      )
    ) {
      this.breakoutGroupsService
        .GroupDelete(this.bogSelected.breakoutGroupID)
        .subscribe({
          next: _ => this.selectAnother()
        });
    }
  }
}
