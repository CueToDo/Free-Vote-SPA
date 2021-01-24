import { AppDataService } from 'src/app/services/app-data.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Models & enums
import { Point, PointFeedback } from '../../models/point.model';
import { PointSupportLevels, PointFlags, PointTypesEnum } from '../../models/enums';

// Services
import { PointsService } from '../../services/points.service';
import { LocalDataService } from '../../services/local-data.service';


@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
  preserveWhitespaces: true,
})
export class PointComponent implements OnInit {

  @Input() point: Point;
  @Input() pointCount: number;
  @Input() isPorQPoint: boolean;
  @Input() possibleAnswer: boolean;
  @Input() isMyAnswer: boolean;

  @Output() PointDeleted = new EventEmitter();
  @Output() AddPointToAnswers = new EventEmitter();
  @Output() RemovePointFromAnswers = new EventEmitter();

  // bind to point slashtags (not topic)
  slashTags: string[];  // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];

  editing = false;
  justUpdated = false;

  get showLink(): boolean {
    return this.appData.ShowSource(this.point.pointTypeID);
  }

  error: string;

  // https://stackoverflow.com/questions/37277527/how-to-use-enum-in-angular-2-templates
  // https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates
  public PointTypesEnum = PointTypesEnum;


  constructor(
    public localData: LocalDataService, // public - used in template
    private appData: AppDataService,
    private pointsService: PointsService
  ) { }


  ngOnInit(): void {
    // Angular Workshop filter is not a function

    // this.tags = this.tags.filter(x => x.SlashTag !== '/hash');

    // this.tags = this.point.Tags;

    // this.tags = this.point.Tags.filter((tag: Tag) => tag.SlashTag !== this.router.url);
    // this.tags = this.point.Tags.filter((tag, index, arr) => tag.SlashTag !== this.router.url);

    // function notThisRoute (element: Tag, index, array) { return element.SlashTag !== this.router.url; }
    // this.tags = this.point.Tags.filter(notThisRoute);

    // this.tags = this.point.Tags.filter(x => true);


    // No subscriptions

    this.AssignTags();

  }

  AssignTags(): void {
    // Filter out current tag
    // SlashTagSelected updated as soon as tag clicked
    this.slashTags = this.point.slashTags.filter(tag => tag.toLowerCase() !== this.localData.PreviousSlashTagSelected.toLowerCase());
  }

  // PointTitle or PointID to be able to select single point
  get SelectSingleTitle(): string {
    if (!!this.point.pointLink) {
      return this.point.pointLink;
    } else {
      return this.point.pointID.toString();
    }
  }

  PointFeedback(pointSupportLevel: PointSupportLevels): void {

    if (!this.point.pointFeedback.feedbackIsUpdatable) {
      alert('Feedback is not updatable');
    } else {

      if (this.point.pointFeedback.supportLevelID === pointSupportLevel && !this.point.pointFeedback.pointModified) {
        // If clicked on the current support level then delete it
        if (confirm('Are you sure you wish to delete your feedback?')) {
          pointSupportLevel = PointSupportLevels.None;
        } else {
          return; // Cancel feedback delete
        }
      }

      this.pointsService.PointFeedback(this.point.pointID, pointSupportLevel, '', false)
        .subscribe({
          next: response => {
            console.log('FEEDBACK API RESPONSE', response);
            this.point.pointFeedback = response as PointFeedback;
            console.log('CLIENT DATA UPDATED PointSupportlevel: ', this.point.pointFeedback.supportLevelID);
          },
          error: serverError => {
            console.log('PointFeedback Error', serverError);
            this.error = serverError.error.detail;
          }
        });

    }
  }

  PointTypeVote(pointTypesEnum: PointTypesEnum): void {

  }

  AddToAnswers(pointID: number): void {
    this.AddPointToAnswers.emit(pointID);
  }

  RemoveFromAnswers(pointID: number): void {
    this.RemovePointFromAnswers.emit(pointID);
  }

  favoriteIcon(): string {
    return this.point.isFavourite ? 'favorite' : 'favorite_border';
  }

  WoW(): void {

    console.log('BEGIN WoW');

    // ToDo Angular Workshop: Cannot read property 'name' of undefined
    // point.SupportLevelID was a number. Loosely typed

    // This is the conditional first step, mandatory second step conundrum
    // Now no recursion - allow business layer to handle

    // Allow business layer to handle support if WoWing
    // if (!this.point.PointFeedback.WoWVote && this.point.PointFeedback.SupportLevelID !== PointSupportLevels.Support) {
    //   console.log('10-6: ', this.point.PointFeedback.SupportLevelID);
    //   this.PointFeedback(PointSupportLevels.Support).then(
    //     success => {
    //       console.log(success, 'Success PointSupportlevel: ', this.point.PointFeedback.SupportLevelID);
    //       this.WoW();
    //     },
    //     fail => console.log('fail: ', fail));
    // } else {

    // Update WoW

    this.pointsService.PointWoWVote(this.point.pointID, !this.point.pointFeedback.woWVote)
      .subscribe(
        pointFeedback => {
          this.point.pointFeedback = pointFeedback; // Toggle the WoW vote
        });
  }

  Support(): void {
    this.PointFeedback(PointSupportLevels.Support);
  }

  Neutral(): void {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.StandAside);
  }

  Oppose(): void {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.Oppose);
  }

  Report(): void {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.Report);
  }

  anon(): void {
    alert('ToDo');
  }


  edit(): void {
    this.editing = true;
  }

  delete(): void {
    if (confirm('Are you sure you wish to delete this point?')) {
      this.pointsService.PointDelete(this.point.pointID)
        .subscribe(
          {
            next: () => this.PointDeleted.emit(this.point.pointID),
            // not looking at any result <<<
            error: serverError => {
              this.error = serverError.error.detail;
              console.log(this.error);
            }
          });

    }
  }


  favourite(): void {
    const deleteFavourite = this.point.isFavourite;

    this.pointsService.PointFlag(deleteFavourite, this.point.pointID, PointFlags.Favourite)
      .subscribe(() => this.point.isFavourite = !deleteFavourite);
  }

  onCancelEdit(): void {
    this.editing = false;
  }

  onCompleteEdit(): void {

    this.AssignTags();

    if (this.point.pointFeedback.supportLevelID !== PointSupportLevels.None) {
      this.point.pointFeedback.pointModified = true;
    }

    this.justUpdated = true;

    if (this.point.showLinkPreview) {
      // Get Link metadata for preview
      this.pointsService.PointSourceMetaDataUpdate(this.point.pointID, this.point.link)
        .subscribe(metaData => {
          this.point.linkTitle = metaData.title;
          this.point.linkDescription = metaData.description;
          this.point.linkImage = metaData.image;
        });
    }

    this.editing = false;
  }


  OccupyHandSignals(): void {
    window.open('https://en.m.wikipedia.org/wiki/Occupy_movement_hand_signals', '_blank');
  }

}
