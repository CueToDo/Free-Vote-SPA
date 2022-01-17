// Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Models
import {
  BreakoutGroup,
  CharacterTheme
} from 'src/app/models/break-out-group.model';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { BreakOutGroupsService } from 'src/app/services/break-out-groups.service';

@Component({
  selector: 'app-group-selection',
  templateUrl: './group-selection.component.html',
  styleUrls: ['./group-selection.component.css']
})
export class GroupSelectionComponent implements OnInit {
  // Break-out groups
  public breakoutGroups: BreakoutGroup[] = [];
  public breakoutGroupsMessage = '';
  public viewingCurrent = true;
  public joinAnother = false;
  public startingNew = false;
  public rooms: Kvp[] = [];
  public roomSelected = new Kvp();
  public characterThemes: CharacterTheme[] = [];
  public characterThemeSelected: CharacterTheme = new CharacterTheme();

  slashTag = '';
  bogError = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private breakoutGroupsService: BreakOutGroupsService
  ) {}

  ngOnInit(): void {
    const routeParams = this.activeRoute.snapshot.params;
    this.slashTag = routeParams['tag'];
    this.breakoutGroupsJoined(true);
  }

  breakoutGroupsJoined(refresh: boolean): void {
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupMembership(this.slashTag, refresh)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage = 'No break-out groups joined';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.bogError = serverError.error.detail)
      });
  }

  breakoutGroupsAvailable(refresh: boolean): void {
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupsAvailable(this.slashTag, refresh)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage =
              'No break-out groups available to join. Consider starting a new group';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.bogError = serverError.error.detail)
      });
  }

  viewMyGroups(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = true;
    this.joinAnother = false;
    this.startingNew = false;
    this.breakoutGroupsJoined(false);
  }

  viewAvailable(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = false;
    this.joinAnother = true;
    this.startingNew = false;
    this.breakoutGroupsAvailable(false);
  }

  startNew(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = false;
    this.joinAnother = false;
    this.startingNew = true;

    this.roomSelected = new Kvp();
    this.characterThemeSelected = {
      breakoutGroupThemeID: -1,
      themeName: '',
      characters: 0
    };

    this.breakoutGroupsService.BreakoutRooms(this.slashTag).subscribe({
      next: rooms => {
        this.rooms = rooms;
        console.log(rooms);
      },
      error: serverError => (this.bogError = serverError.error.detail)
    });

    this.breakoutGroupsService
      .CharacterThemes()
      .subscribe({ next: themes => (this.characterThemes = themes) });
  }

  groupStart() {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    if (!this.roomSelected.value || this.roomSelected.value < 1) {
      this.bogError = 'please select a room';
    } else if (
      !this.characterThemeSelected ||
      this.characterThemeSelected.breakoutGroupThemeID < 1
    ) {
      this.bogError = 'please select a character theme';
    } else {
      this.breakoutGroupsService
        .GroupStart(
          this.slashTag,
          this.roomSelected.value,
          this.characterThemeSelected.breakoutGroupThemeID
        )
        .subscribe({
          next: _ => {
            this.breakoutGroupsJoined(true);
            this.viewMyGroups();
          },
          error: serverError => (this.bogError = serverError.error.detail)
        });
    }
  }

  groupJoin(groupID: number) {
    var group = this.breakoutGroups.filter(
      group => group.breakoutGroupID === groupID
    );
    if (!!group && group.length > 0) {
      if (!group[0].member) {
        this.breakoutGroupsService.GroupJoin(groupID).subscribe({
          next: _ => this.refresh(),
          error: serverError => (this.bogError = serverError.error.detail)
        });
      }
    }
  }

  refresh() {
    this.breakoutGroupsJoined(true);
    this.viewMyGroups();
  }
}
