// Angular
import {
  Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';

// Material
import { MatDialog } from '@angular/material/dialog';

// rxjs
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Models & enums
import { Point } from 'src/app/models/point.model';
import { Tag } from 'src/app/models/tag.model';
import {
  PointSupportLevels,
  PointFlags,
  PointTypesEnum
} from 'src/app/models/enums';

// Components
import { FullSizeImagesComponent } from 'src/app/base/full-size-images/full-size-images.component';
import { LocalTagsComponent } from 'src/app/local/local-tags/local-tags.component';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { PointsService } from 'src/app/services/points.service';
import { TagsService } from 'src/app/services/tags.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
  preserveWhitespaces: true
})
export class PointComponent implements AfterViewInit {
  @Input() point = new Point();
  @Input() pointCount = 0;
  @Input() isPorQPoint = false;
  @Input() possibleAnswer = false;
  @Input() isMyAnswer = false;
  @Input() isParentPoint = false;
  @Input() isComment = false;
  @Input() searchTerm = '';
  @Input() sharing = false;
  @Input() ancestor = false;
  @Input() creatingNewComment = false; // New comment button has not been clicked
  @Input() feedbackOn = true; // Controls toolbar display

  @Output() CompleteEdit = new EventEmitter();
  @Output() PointDeleted = new EventEmitter();
  @Output() AddPointToAnswers = new EventEmitter();
  @Output() RemovePointFromAnswers = new EventEmitter();
  @Output() AltSlashTagSelected = new EventEmitter<string>();
  @Output() SelectComment = new EventEmitter<number>();
  @Output() NewComment = new EventEmitter();
  @Output() CancelNewComment = new EventEmitter();

  // bind to point slashtags (not topic)
  tags: Tag[] = [];
  youTubeIDs: string[] = [];
  vimeoIDs: string[] = [];
  soundCloudTrackIDs: string[] = [];
  pointHTMLwithoutEmbed = '';

  editing = false;
  updatingPreview = false;

  // Truncated Text
  showFullText = false;
  @ViewChild('elPointHtml') elPointHtml: ElementRef | undefined;

  public PointSupportLevels = PointSupportLevels;

  get linkShare(): string {
    return (
      this.localData.PreviousSlashTagSelected + '/' + this.SelectSingleTitle
    );
  }

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
    private appData: AppDataService,
    public auth0Service: AuthService,
    private lookupsService: LookupsService,
    private pointsService: PointsService,
    private tagsService: TagsService,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    //ngOnInit occurs too soon for parentPoint in pointComments
    if (!this.isParentPoint) {
      this.Initialise();
    }
  }

  Initialise() {
    this.AssignTags();

    if (this.point?.isNewSource) {
      // Will not be newSource if not showLinkPreview - so no redundant check
      // A new point has been added to the list but meta data has not been retrieved yet for source
      this.FetchMetaData();
    }

    this.ExtractMediaEmbeds();
    this.HighlightSearchTerm();
  }

  public AssignAndInitialise(point: Point) {
    this.point = point;
    this.Initialise();
  }

  AssignTags(): void {
    // Filter out current tag
    // SlashTagSelected updated as soon as tag clicked
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.tags = this.point.tags.filter(
        tag =>
          tag.slashTag.toLowerCase() !==
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

  ExtractMediaEmbeds(): void {
    // https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html
    const pointParser = new DOMParser();

    const pointDoc = pointParser.parseFromString(
      this.point.pointHTML,
      'text/html'
    );

    const figureElements = Array.from(pointDoc.querySelectorAll('figure'));

    if (!!figureElements && figureElements.length > 0) {
      figureElements.forEach(figureElement => {
        const figureParser = new DOMParser();
        const figureDoc = figureParser.parseFromString(
          figureElement.innerHTML,
          'text/html'
        );
        const oembedElement = figureDoc.querySelector('oembed');
        const url = oembedElement?.getAttribute('url') + '';
        this.AddToMediaLists(url);
        figureElement.remove();
      });
    }

    this.pointHTMLwithoutEmbed = pointDoc.body.innerHTML;
  }

  AddToMediaLists(url: string): void {
    if (!url) return;

    const urlParts = url.split('/');
    const route = urlParts[urlParts.length - 1]; // watch?v=Ef9QnZVpVd8&amp;t=49s

    if (!route) return;

    if (url.includes('youtu.be') && !this.youTubeIDs.includes(route)) {
      this.youTubeIDs.push(route);
    } else if (url.includes('youtube.com')) {
      let id = route.split('v=')[1]; // Ef9QnZVpVd8 &amp;t= 49s
      let timeSplit = id.split('&start='); // Ef9QnZVpVd8 49s
      if (timeSplit.length > 1) {
        let start = timeSplit[1].replace('s', ''); // 49
        id = `${timeSplit[0]}?start=${start}`; // Ef9QnZVpVd8?t=49
      }
      if (!this.youTubeIDs.includes(id)) {
        this.youTubeIDs.push(id);
      }
    } else if (url.includes('vimeo.com') && !this.vimeoIDs.includes(route)) {
      this.vimeoIDs.push(route);
    } else if (url.includes('soundcloud')) {
    }
  }

  HighlightSearchTerm(): void {
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

  Error(error: string) {
    this.error = error;
  }

  PointTypeVote(pointTypesEnum: PointTypesEnum): void {}

  AddToAnswers(pointID: number): void {
    this.AddPointToAnswers.emit(pointID);
  }

  RemoveFromAnswers(pointID: number): void {
    let confirmRemove = true;
    if (!this.point.tags || this.point.tags.length === 0) {
      confirmRemove = confirm(
        'As this answer is not tagged, removing this answer from the question is the same as delete. \n\nAre you sure you wish to delete this answer?'
      );
    }
    if (confirmRemove) this.RemovePointFromAnswers.emit(pointID);
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
        this.pointsService
          .PointDelete(this.point.pointID, this.localData.ConstituencyIDVoter)
          .subscribe({
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
      // weird shit - why is this const necessary?
      const deleteFavourite = this.point.isFavourite;

      this.pointsService
        .PointFlag(deleteFavourite, this.point.pointID, PointFlags.Favourite)
        .subscribe(_ => {
          this.point.isFavourite = !deleteFavourite;
        });
    }
  }

  important(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      // weird shit - why is this const necessary?
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

  addLocalTags(): void {
    // Open LocalTagsComponent as dialog. COmponent fetches relevant tags from API

    const dialogRef = this.dialog.open(LocalTagsComponent, {
      width: '480px',
      data: {
        pointID: this.point.pointID,
        constituencyTags: this.localData.forConstituency,
        constituencyID: this.localData.ConstituencyIDVoter
      }
    });

    dialogRef.afterClosed().subscribe((tags: Tag[]) => {
      this.tagsService
        .PointTagsSave(
          this.point.pointID,
          this.localData.ConstituencyIDVoter,
          tags.filter(tag => tag.tagByMe != tag.tagByMeNew)
        )
        .subscribe(); // To do confirmation
    });
  }

  viewFullSizeImages() {
    if (!this.point.csvPointImages && !this.point.csvPointImagesEmbedded)
      return;

    this.dialog.open(FullSizeImagesComponent, {
      // width: '480px',
      data: {
        csvPointImages: this.point.csvPointImages,
        csvPointImagesEmbedded: this.point.csvPointImagesEmbedded
      }
    });
  }

  onCancelEdit(): void {
    this.editing = false;
  }

  onCompleteEdit(): void {
    if (!this.point) {
      this.error = 'Missing: point';
    } else {
      this.AssignTags();
      this.ExtractMediaEmbeds();
      this.HighlightSearchTerm();

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

  // Don't depend on routerLink - paramchange not detected - dunno why
  setSlashTag(slashTag: string): void {
    this.tagsService.SetSlashTag(slashTag);
    // Communicate to parent
    this.AltSlashTagSelected.emit(slashTag);
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
          .PointLinkedWebsiteMetaDataUpdate(
            this.point.pointID,
            this.point.linkAddress
          )
          .subscribe({
            next: metaData => {
              if (this.point) {
                this.point.linkTitle = metaData.title;
                this.point.linkDescription = metaData.description;
                this.point.linkImage = metaData.image;
                this.point.showPreview = metaData.showPreview;
                this.updatingPreview = false;

                if (!metaData.showPreview) {
                  this.point.pointHTML = this.appData.unhideLinks(
                    this.point.pointHTML
                  );
                }
                this.ExtractMediaEmbeds();
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

  selectComment() {
    this.SelectComment.emit(this.point.pointID);
  }

  // Snme button used to create and cancel new comment
  newComment() {
    if (this.creatingNewComment) {
      this.CancelNewComment.emit();
    } else {
      this.NewComment.emit();
    }
  }
}
