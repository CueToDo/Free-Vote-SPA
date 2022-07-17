// Angular
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';

// rxjs
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// Models & enums
import { Point, PointFeedback } from 'src/app/models/point.model';
import {
  PointSupportLevels,
  PointFlags,
  PointTypesEnum
} from 'src/app/models/enums';

// Services
import { LookupsService } from 'src/app/services/lookups.service';
import { PointsService } from 'src/app/services/points.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
  preserveWhitespaces: true
})
export class PointComponent implements OnInit {
  @Input() point = new Point();
  @Input() pointCount = 0;
  @Input() isPorQPoint = false;
  @Input() possibleAnswer = false;
  @Input() isMyAnswer = false;
  @Input() searchTerm = '';

  @Output() CompleteEdit = new EventEmitter();
  @Output() PointDeleted = new EventEmitter();
  @Output() AddPointToAnswers = new EventEmitter();
  @Output() RemovePointFromAnswers = new EventEmitter();

  // bind to point slashtags (not topic)
  slashTags: string[] = []; // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];
  youTubeIDs: string[] = [];
  vimeoIDs: string[] = [];
  soundCloudTrackIDs: string[] = [];
  pointHTMLwithoutEmbed = '';
  linkShare = '';

  editing = false;
  updatingPreview = false;

  // Truncated Text
  showFullText = false;
  @ViewChild('elPointHtml') elPointHtml: ElementRef | undefined;

  public PointSupportLevels = PointSupportLevels;

  get showLink(): boolean {
    if (!this.point) {
      this.error = 'Missing: point';
      return false;
    } else {
      return this.lookupsService.ShowSource(this.point.pointTypeID);
    }
  }

  error = '';

  // https://stackoverflow.com/questions/37277527/how-to-use-enum-in-angular-2-templates
  // https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates
  public PointTypesEnum = PointTypesEnum;

  constructor(
    public localData: LocalDataService, // public - used in template
    private lookupsService: LookupsService,
    private pointsService: PointsService
  ) { }

  ngOnInit(): void {
    // No subscriptions

    this.AssignTags();

    if (this.point?.isNewSource) {
      // Will not be newSource if not showLinkPreview - so no redundant check
      // A new point has been added to the list but meta data has not been retrieved yet for source
      this.FetchMetaData();
    }

    this.extractMediaEmbeds();

    this.linkShare =
      this.localData.PreviousSlashTagSelected + '/' + this.SelectSingleTitle;
  }

  AssignTags(): void {
    // Filter out current tag
    // SlashTagSelected updated as soon as tag clicked
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.slashTags = this.point.slashTags.filter(
        tag =>
          tag.toLowerCase() !==
          this.localData.PreviousSlashTagSelected.toLowerCase()
      );
    }
  }

  // PointTitle or PointID to be able to select single point
  get SelectSingleTitle(): string {
    if (!this.point) {
      this.error = 'Missing: point';
      return '';
    } else {
      if (!!this.point.pointSlug) {
        return this.point.pointSlug;
      } else {
        return this.point.pointID.toString();
      }
    }
  }

  extractMediaEmbeds(): void {
    // https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html

    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.youTubeIDs = [];
      if (this.point.youTubeID) {
        this.youTubeIDs.push(this.point.youTubeID);
      }

      this.soundCloudTrackIDs = [];
      if (this.point.soundCloudTrackID) {
        this.soundCloudTrackIDs.push(this.point.soundCloudTrackID);
      }

      this.vimeoIDs = [];

      const split = this.point.pointHTML.split('<figure class="media">');

      if (split.length > 0) {
        let i: number;
        let oembedPlus: string[];
        let url: string;
        let id = '';
        let urlParts = [];

        for (i = 1; i < split.length; i++) {
          oembedPlus = split[i].split('</figure>');
          url = oembedPlus[0].split('"')[1];
          urlParts = url.split('/');

          if (url.includes('youtu.be')) {
            id = urlParts[urlParts.length - 1];
            this.youTubeIDs.push(id);
          } else if (url.includes('youtube.com')) {
            id = urlParts[urlParts.length - 1].split('v=')[1];
            this.youTubeIDs.push(id);
          } else if (url.includes('vimeo.com')) {
            id = urlParts[urlParts.length - 1];
            this.vimeoIDs.push(id);
          } else if (url.includes('soundcloud')) {
          }
          split[i] = oembedPlus[1]; // Use only what's after the figure element
        }
      }

      this.pointHTMLwithoutEmbed = split.join(''); // pointHTML stripped of <figure> elements added by ckEditor for media embed

      // Highlight search term
      // https://stackoverflow.com/questions/7313395/case-insensitive-replace-all
      if (!!this.searchTerm) {
        var regEx = new RegExp(this.searchTerm, 'ig'); // search term is case insensitive and global - all occurrences replaced
        const replace = `<span class="highlight">${this.searchTerm.toUpperCase()}</span>`;

        this.point.pointTitle = this.point.pointTitle.replace(regEx, replace);

        this.pointHTMLwithoutEmbed = this.pointHTMLwithoutEmbed.replace(
          regEx,
          replace
        );
      }
    }
  }

  PointFeedback(pointSupportLevel: PointSupportLevels): void {
    this.error = '';

    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      if (!this.point.pointFeedback.feedbackIsUpdatable) {
        alert('Feedback is not updatable');
      } else {
        if (
          this.point.pointFeedback.supportLevelID === pointSupportLevel &&
          !this.point.pointFeedback.pointModified
        ) {
          // If clicked on the current support level then delete it
          if (confirm('Are you sure you wish to delete your feedback?')) {
            pointSupportLevel = PointSupportLevels.None;
          } else {
            return; // Cancel feedback delete
          }
        }

        this.pointsService
          .PointFeedback(this.point.pointID, pointSupportLevel, '', false)
          .subscribe({
            next: response => {
              console.log('FEEDBACK API RESPONSE', response);
              if (this.point) {
                this.point.pointFeedback = response as PointFeedback;
              }
              console.log(
                'CLIENT DATA UPDATED PointSupportlevel: ',
                this.point?.pointFeedback?.supportLevelID
              );
            },
            error: serverError => {
              console.log('PointFeedback Error', serverError);
              this.error = serverError.error.detail;
            }
          });
      }
    }
  }

  PointTypeVote(pointTypesEnum: PointTypesEnum): void { }

  AddToAnswers(pointID: number): void {
    this.AddPointToAnswers.emit(pointID);
  }

  RemoveFromAnswers(pointID: number): void {
    let confirmRemove = true;
    if (!this.point.slashTags || this.point.slashTags.length === 0) {
      confirmRemove = confirm(
        'As this answer is not tagged, removing this answer from the question is the same as delete. \n\nAre you sure you wish to delete this answer?'
      );
    }
    if (confirmRemove) this.RemovePointFromAnswers.emit(pointID);
  }

  get favoriteIcon(): string {
    if (!this.point) {
      this.error = 'Missing: point';
      return '';
    } else {
      return this.point.isFavourite ? 'favorite' : 'favorite_border';
    }
  }

  // ToDo Again (Maybe)
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

    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.pointsService
        .PointWoWVote(this.point.pointID, !this.point.pointFeedback.woWVote)
        .subscribe(pointFeedback => {
          if (this.point) {
            this.point.pointFeedback = pointFeedback; // Toggle the WoW vote
          }
        });
    }
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
    this.error = '';
    this.editing = true;
  }

  delete(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      if (confirm('Are you sure you wish to delete this point?')) {
        this.pointsService.PointDelete(this.point.pointID).subscribe({
          next: _ => {
            if (this.point) {
              this.PointDeleted.emit(this.point.pointID);
            }
          },
          // not looking at any result <<<
          error: serverError => {
            this.error = serverError.error.detail;
            console.log(this.error);
          }
        });
      }
    }
  }

  favourite(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      const deleteFavourite = this.point.isFavourite;

      this.pointsService
        .PointFlag(deleteFavourite, this.point.pointID, PointFlags.Favourite)
        .subscribe(_ => {
          if (this.point) {
            this.point.isFavourite = !deleteFavourite;
          }
        });
    }
  }

  important(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      const deleteImportant = this.point.isImportant;

      this.pointsService
        .PointFlag(deleteImportant, this.point.pointID, PointFlags.Important)
        .subscribe(_ => {
          if (this.point) {
            this.point.isImportant = !deleteImportant;
          }
        });
    }
  }

  onCancelEdit(): void {
    this.editing = false;
  }

  onCompleteEdit(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.AssignTags();
      this.extractMediaEmbeds();

      if (this.point.pointFeedback.supportLevelID !== PointSupportLevels.None) {
        this.point.pointFeedback.pointModified = true;
      }

      this.FetchMetaData();

      // Close editor and redisplay the point
      this.editing = false;


      // Proved, we need a delay for change in editing take effect
      let emitted = false;
      interval(200)
        .pipe(takeWhile(() => !emitted))
        .subscribe(_ => {
          this.CompleteEdit.emit(this.point.pointID);
          emitted = true;
        });
    }
  }

  FetchMetaData(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      // Ensure isNewSource set correctly in point edit
      if (this.point.linkAddress && this.point.isNewSource) {
        // Get Link metadata for preview
        // Also handled in new point in tags-and-points component
        this.updatingPreview = true;
        this.pointsService
          .PointSourceMetaDataUpdate(this.point.pointID, this.point.linkAddress)
          .subscribe({
            next: metaData => {
              if (this.point) {
                this.point.linkTitle = metaData.title;
                this.point.linkDescription = metaData.description;
                this.point.linkImage = metaData.image;
                this.updatingPreview = false;
              }
            },
            error: err => {
              this.error = err.error.detail;
              console.log('ERROR', err.error.detail);
              this.point.linkTitle = '';
              this.point.linkDescription = '';
              this.point.linkImage = '';
              this.updatingPreview = false;
            }
          });
      }
    }
  }

  OccupyHandSignals(): void {
    window.open(
      'https://en.m.wikipedia.org/wiki/Occupy_movement_hand_signals',
      '_blank'
    );
  }

  elementTruncated(): boolean {
    return (
      this.elPointHtml?.nativeElement.scrollHeight >
      this.elPointHtml?.nativeElement.clientHeight ||
      this.elPointHtml?.nativeElement.scrollWidth >
      this.elPointHtml?.nativeElement.clientWidth
    );
  }

  showMore(more: boolean): void {
    this.showFullText = more;
  }
}
