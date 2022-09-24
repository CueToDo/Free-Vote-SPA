// Angular
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Models
import {
  BreakoutGroup,
  Character,
  CharacterTheme
} from 'src/app/models/break-out-group.model';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { BreakOutGroupsService } from 'src/app/services/break-out-groups.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-group-selection',
  templateUrl: './group-selection.component.html',
  styleUrls: ['./group-selection.component.css']
})
export class GroupSelectionComponent {
  @Input() public constituencyID = 0;
  @Input() public tagDisplay = '';
  @Output() BogSelected = new EventEmitter<BreakoutGroup>();

  // Break-out groups
  public breakoutGroups: BreakoutGroup[] = [];
  public breakoutGroupsMessage = '';
  public viewingCurrent = true;
  public joinAnother = false;
  public startingNew = false;
  public rooms: Kvp[] = [];
  public roomSelected = new Kvp();
  public characterThemes: CharacterTheme[] = [];
  public characterThemeSelected = new CharacterTheme();

  roomInUse = true;
  creatingNewRoom = false;
  newRoomName = '';

  characterThemeInUse = true;
  creatingNewCharacterTheme = false;
  newCharacterThemeName = '';

  themeCharacters: Character[] = [];

  creatingNewCharacter = false;
  newCharacterName = '';

  public get slashTag(): string {
    return this.localData.TopicToSlashTag(this.tagDisplay);
  }

  public roomSlug(roomName: string): string {
    return this.localData.TopicToSlashTag(roomName);
  }

  roomError = '';
  themeError = '';
  bogError = '';

  constructor(
    public localData: LocalDataService,
    private breakoutGroupsService: BreakOutGroupsService
  ) {}

  public breakoutGroupsJoined(refresh: boolean): void {
    this.roomError = '';
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupMembership(this.constituencyID, this.tagDisplay, refresh)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage = 'No break-out groups joined';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.roomError = serverError.error.detail)
      });
  }

  breakoutGroupsAvailable(): void {
    this.roomError = '';
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupsAvailable(this.constituencyID, this.tagDisplay)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage =
              'No break-out groups available to join. Consider starting a new group';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.roomError = serverError.error.detail)
      });
  }

  viewMyGroups(): void {
    this.breakoutGroupsMessage = '';
    this.roomError = '';
    this.viewingCurrent = true;
    this.joinAnother = false;
    this.startingNew = false;
    this.breakoutGroupsJoined(false);
  }

  viewAvailable(): void {
    this.breakoutGroupsMessage = '';
    this.roomError = '';
    this.viewingCurrent = false;
    this.joinAnother = true;
    this.startingNew = false;
    this.breakoutGroupsAvailable();
  }

  startNew(): void {
    this.breakoutGroupsMessage = '';
    this.roomError = '';
    this.viewingCurrent = false;
    this.joinAnother = false;
    this.startingNew = true;

    this.roomSelected = new Kvp();
    this.characterThemeSelected = {
      characterThemeID: -1,
      characterTheme: '',
      characters: 0,
      publicTheme: true,
      allCharactersAdded: true,
      isThemeOwner: false
    };

    this.breakoutGroupsService
      .BreakoutRooms(this.constituencyID, this.tagDisplay)
      .subscribe({
        next: rooms => (this.rooms = rooms),
        error: serverError => (this.roomError = serverError.error.detail)
      });

    this.breakoutGroupsService
      .CharacterThemes()
      .subscribe({ next: themes => (this.characterThemes = themes) });
  }

  groupStart() {
    this.breakoutGroupsMessage = '';
    this.roomError = '';
    if (!this.roomSelected.value || this.roomSelected.value < 1) {
      this.roomError = 'please select a room';
      window.location.hash = '';
      window.location.hash = 'bogError';
    } else if (
      !this.characterThemeSelected ||
      this.characterThemeSelected.characterThemeID < 1
    ) {
      this.themeError = 'please select a character theme';
    } else {
      this.breakoutGroupsService
        .GroupStart(
          this.constituencyID,
          this.tagDisplay,
          this.roomSelected.value,
          this.characterThemeSelected.characterThemeID
        )
        .subscribe({
          next: bog => {
            this.breakoutGroupsJoined(true);
            this.viewMyGroups();
            this.bogSelected(this.roomSelected.key);
            if (!!this.roomSelected) this.BogSelected.emit(bog);
          },
          error: serverError => (this.bogError = serverError.error.detail)
        });
    }
  }

  groupJoin(groupID: number) {
    this.roomError = '';
    var group = this.breakoutGroups.filter(
      group => group.breakoutGroupID === groupID
    );
    if (!!group && group.length > 0) {
      if (!group[0].member) {
        this.breakoutGroupsService.GroupJoin(groupID).subscribe({
          next: _ => this.bogSelected(group[0].breakoutRoom),
          error: serverError => (this.roomError = serverError.error.detail)
        });
      }
    }
  }

  refresh() {
    this.breakoutGroupsJoined(true);
    this.viewMyGroups();
  }

  bogSelected(roomName: string): void {
    var bog = this.breakoutGroups.filter(g => g.breakoutRoom === roomName);
    if (bog && bog.length === 1) this.BogSelected.emit(bog[0]);
  }

  checkRoomInUse(): void {
    this.roomError = '';
    this.breakoutGroupsService.RoomInUse(this.roomSelected.value).subscribe({
      next: inUse => (this.roomInUse = inUse),
      error: serverError => (this.roomError = serverError.error.detail)
    });
  }

  deleteRoom() {
    this.roomError = '';
    this.breakoutGroupsService.RoomDelete(this.roomSelected.value).subscribe({
      next: _ => {
        this.rooms = this.rooms.filter(
          r => r.value !== this.roomSelected.value
        );
        if (!!this.rooms && this.rooms.length > 0)
          this.roomSelected = this.rooms[0];
        this.checkRoomInUse();
      },
      error: serverError => (this.roomError = serverError.error.detail)
    });
  }

  newRoom(): void {
    this.creatingNewRoom = true;
  }

  saveNewRoom(): void {
    if (!this.newRoomName) {
      this.roomError = 'Room name must be provided';
    } else {
      this.roomError = '';
      this.breakoutGroupsService.RoomCreate(this.newRoomName).subscribe({
        next: num => {
          this.roomSelected = { key: this.newRoomName, value: num };
          this.rooms.push(this.roomSelected);
          this.creatingNewRoom = false;
          this.newRoomName = '';
        },
        error: serverError => {
          this.roomError = serverError.error.detail;
        }
      });
    }
  }

  cancelNewRoom() {
    this.roomError = '';
    this.newRoomName = '';
    this.creatingNewRoom = false;
  }

  checkThemeInUse(): void {
    this.themeError = '';
    this.breakoutGroupsService
      .CharacterThemeInUse(this.characterThemeSelected.characterThemeID)
      .subscribe({
        next: inUse => (this.characterThemeInUse = inUse),
        error: serverError => (this.themeError = serverError.error.detail)
      });
  }

  deleteCharacterTheme() {
    this.themeError = '';
    this.breakoutGroupsService
      .CharacterThemeDelete(this.characterThemeSelected.characterThemeID)
      .subscribe({
        next: _ => {
          this.characterThemes = this.characterThemes.filter(
            r =>
              r.characterThemeID !==
              this.characterThemeSelected.characterThemeID
          );
          if (!!this.characterThemes && this.characterThemes.length > 0)
            this.characterThemeSelected = this.characterThemes[0];
          this.checkThemeInUse();
        },
        error: serverError => (this.themeError = serverError.error.detail)
      });
  }

  newCharacterTheme(): void {
    this.creatingNewCharacterTheme = true;
  }

  saveNewCharacterTheme(): void {
    if (!this.newCharacterThemeName) {
      this.themeError = 'Character theme name be provided';
    } else {
      this.themeError = '';
      this.breakoutGroupsService
        .CharacterThemeCreate(this.newCharacterThemeName)
        .subscribe({
          next: num => {
            this.characterThemeSelected = {
              characterThemeID: num,
              characterTheme: this.newCharacterThemeName,
              characters: 0,
              publicTheme: true,
              allCharactersAdded: false,
              isThemeOwner: true
            };
            this.characterThemes.push(this.characterThemeSelected);
            this.creatingNewCharacterTheme = false;
            this.creatingNewCharacter = true;
            this.newCharacterThemeName = '';
          },
          error: serverError => {
            this.themeError = serverError.error.detail;
          }
        });
    }
  }

  cancelNewCharacterTheme(): void {
    this.themeError = '';
    this.newCharacterThemeName = '';
    this.creatingNewCharacterTheme = false;
  }

  getThemeCharacters(): void {
    this.themeError = '';
    this.breakoutGroupsService
      .ThemeCharacters(this.characterThemeSelected.characterThemeID)
      .subscribe({
        next: characters => (this.themeCharacters = characters),
        error: serverError => (this.themeError = serverError.error.detail)
      });
  }

  deleteCharacter(characterID: number) {
    this.themeError = '';
    this.breakoutGroupsService
      .CharacterDelete(
        this.characterThemeSelected.characterThemeID,
        characterID
      )
      .subscribe({
        next: _ => {
          // remove character from list
          this.themeCharacters = this.themeCharacters.filter(
            c => c.characterID !== characterID
          );
          this.recountCharacters();
        },
        error: serverError => (this.themeError = serverError.error.detail)
      });
  }

  createNewCharacter() {
    this.creatingNewCharacter = true;
  }

  saveNewCharacter(): void {
    if (!this.newCharacterName) {
      this.themeError = 'Character name be provided';
    } else {
      this.themeError = '';
      this.breakoutGroupsService
        .CharacterCreate(
          this.characterThemeSelected.characterThemeID,
          this.newCharacterName
        )
        .subscribe({
          next: num => {
            this.themeCharacters.push({
              characterName: this.newCharacterName,
              characterID: num,
              inUse: false
            });
            this.creatingNewCharacter = false;
            this.newCharacterName = '';

            this.recountCharacters();
          },
          error: serverError => {
            this.themeError = serverError.error.detail;
          }
        });
    }
  }

  recountCharacters(): void {
    var theme = this.characterThemes.filter(
      t => t.characterThemeID === this.characterThemeSelected.characterThemeID
    );
    if (!!theme && theme.length === 1)
      theme[0].characters = this.themeCharacters.length;
  }

  cancelNewCharacter(): void {
    this.themeError = '';
    this.newCharacterName = '';
    this.creatingNewCharacter = false;
  }
}
