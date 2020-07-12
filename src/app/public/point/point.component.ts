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

  @Output() PointDeleted = new EventEmitter();

  // bind to point slashtags (not topic)
  slashTags: string[];  // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];

  editing = false;
  recommended = false;
  error: string;

  // https://stackoverflow.com/questions/37277527/how-to-use-enum-in-angular-2-templates
  // https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates
  public PointTypesEnum = PointTypesEnum;


  constructor(
    public localData: LocalDataService, // public - used in template
    private pointsService: PointsService
  ) { }


  ngOnInit() {
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

    switch (this.point.pointTypeID) {
      case PointTypesEnum.RecommendedReading:
      case PointTypesEnum.RecommendedListening:
      case PointTypesEnum.RecommendedViewing:
      case PointTypesEnum.ReportOrSurvey:
      case PointTypesEnum.Petition:
        this.recommended = true;
        break;
      default:
        this.recommended = false;
        break;
    }

  }

  AssignTags() {
    // Filter out current tag
    // SlashTagSelected updated as soon as tag clicked
    this.slashTags = this.point.slashTags.filter(tag => tag.toLowerCase() !== this.localData.PreviousSlashTagSelected.toLowerCase());
  }

  // PointTitle or PointID to be able to sleect single point
  get SelectSingleTitle(): string {
    if (!!this.point.linkTitle) {
      return this.point.linkTitle;
    } else {
      return this.point.pointID.toString();
    }
  }

  PointFeedback(pointSupportLevel: PointSupportLevels) {

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

  PointTypeVote(pointTypesEnum: PointTypesEnum) {

  }

  favoriteIcon(): string {
    return this.point.isFavourite ? 'favorite' : 'favorite_border';
  }

  WoW() {

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
    console.log('CAN now WoW');
    this.pointsService.PointWoWVote(this.point.pointID, !this.point.pointFeedback.woWVote)
      .subscribe(
        pointFeedback => {
          this.point.pointFeedback = pointFeedback; // Toggle the WoW vote
        });
  }

  Support() {
    this.PointFeedback(PointSupportLevels.Support);
  }

  Neutral() {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.StandAside);
  }

  Oppose() {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.Oppose);
  }

  Report() {
    // this.point.pointFeedback.woWVote = false;
    this.PointFeedback(PointSupportLevels.Report);
  }



  edit() {
    this.editing = true;
  }

  delete() {
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


  favourite() {
    const deleteFavourite = this.point.isFavourite;

    this.pointsService.PointFlag(deleteFavourite, this.point.pointID, PointFlags.Favourite)
      .subscribe(() => this.point.isFavourite = !deleteFavourite);
  }

  onCancelEdit() {
    this.editing = false;
  }

  onCompleteEdit() {
    this.AssignTags();
    if (this.point.pointFeedback.supportLevelID !== PointSupportLevels.None) {
      this.point.pointFeedback.pointModified = true;
    }
    this.editing = false;
  }

  OccupyHandSignals() {
    window.open('https://en.m.wikipedia.org/wiki/Occupy_movement_hand_signals', '_blank');
  }

}
