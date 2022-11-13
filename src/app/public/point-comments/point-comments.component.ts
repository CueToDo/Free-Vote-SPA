import { concatMap, tap } from 'rxjs/operators';
// Angular
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

//Models
import { Point } from 'src/app/models/point.model';
import { PagePreviewMetaData } from 'src/app/models/pagePreviewMetaData.model';
import { ID } from 'src/app/models/common';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { PointsService } from 'src/app/services/points.service';

// Components
import { PointComponent } from '../point/point.component';
import { PointEditComponent } from '../point-edit/point-edit.component';

@Component({
  selector: 'app-point-comments',
  templateUrl: './point-comments.component.html',
  styleUrls: ['./point-comments.component.css']
})
export class PointCommentsComponent implements OnInit {
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('trvParentPoint') parentPointComponent!: PointComponent;

  parentPoint = new Point();
  points: Point[] = [];
  public IDs: ID[] = [];

  // bind to point slashtags (not topic)
  slashTags: string[] = []; // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];
  youTubeIDs: string[] = [];
  vimeoIDs: string[] = [];
  soundCloudTrackIDs: string[] = [];
  pointHTMLwithoutEmbed = '';

  linkShare = '';
  facebookShare = '';
  twitterShare = '';
  linkToAll = '';
  newComment = false;

  get constituencyID(): number {
    return this.localData.ConstituencyIDVoter;
  }

  alreadyFetchingPointFromDB = false;

  error = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private pointsService: PointsService,
    public localData: LocalDataService, // public - used in template)
    public appData: AppDataService,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {
    const routeParams = this.activeRoute.snapshot.params;

    const slashTag = routeParams['tag'];
    const pointTitle = routeParams['title'];

    this.SelectSpecificPoint(slashTag, pointTitle);
  }

  public SelectSpecificPoint(slashTag: string, pointTitle: string): void {
    this.alreadyFetchingPointFromDB = true;

    this.pointsService
      .GetSpecificPoint(
        this.localData.ConstituencyIDVoter,
        slashTag,
        pointTitle
      ) // Returns a PointSelectionResult
      .pipe(
        tap(psr => {
          const point = psr.points[0];
          this.parentPoint = point; // Change detection is not working immediately here.
          // PointComponent does not receive the update automatically
          // Manually pass the vlaue just received and initialise the component
          this.parentPointComponent.AssignAndInitialise(point);

          this.DisplayShareLinks();

          // SSR Initial page render
          const preview = {
            pagePath: this.router.url,
            title: point.pointTitle,
            description: point.preview,
            image: point.previewImage
          } as PagePreviewMetaData;

          // Notify app.component to set meta data for SEO & Social scraping
          this.appData.SSRInitialMetaData$.next(preview);

          // Finally link back to all points for tag
          this.linkToAll = this.localData.PreviousSlashTagSelected + '/points';

          // now we have pointID, select comments
          this.SelectComments(); // doesn't return anything

          // will return original psr from GetSpecificPoint
        })
      )
      .subscribe(); // no need to do anything
  }

  // return this.pointsService.PointsSelectComments(
  //   point.pointID,
  //   this.localData.ConstituencyIDVoter
  // ); // Returns a PointSelectionResult

  SelectComments() {
    this.pointsService
      .PointsSelectComments(
        this.parentPoint.pointID,
        this.localData.ConstituencyIDVoter
      )
      .subscribe({
        next: psr => (this.points = psr.points),
        error: err => {
          this.error = err.error.detail;
        },
        complete: () => (this.alreadyFetchingPointFromDB = false)
      });
  }

  DisplayShareLinks(): void {
    this.linkShare =
      this.localData.websiteUrlWTS.replace(
        'http://localhost:7027',
        'https://free.vote'
      ) +
      this.localData.PreviousSlashTagSelected +
      '/' +
      this.SelectSingleTitle;

    const linkShareEncoded = encodeURIComponent(this.linkShare);
    const titleEncoded = encodeURIComponent(this.parentPoint.pointTitle);

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkShareEncoded}&amp;src=sdkpreparse`;
    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${titleEncoded}&url=${linkShareEncoded}`;

    // Client side scripts
    if (isPlatformBrowser(this.platformId)) {
      FB.XFBML.parse(); // now we can safely call parse method
      this.loadTwitterScript();
    }
  }

  // PointTitle or PointID to be able to select single point
  get SelectSingleTitle(): string {
    if (!this.parentPoint) {
      this.error = 'Missing: point';
      return '';
    } else {
      if (!!this.parentPoint.pointSlug) {
        return this.parentPoint.pointSlug;
      } else {
        return this.parentPoint.pointID.toString();
      }
    }
  }

  ShareByEmail() {
    window.open(
      `mailto:?subject=${this.parentPoint.pointTitle}&body=Hi,%0D%0A%0D%0ATake a look at this from the ${this.localData.website} website - what do you think?%0D%0A%0D%0A${this.linkShare}`,
      '_blank'
    );
  }

  message(message: string) {
    alert(message);
  }

  loadTwitterScript(): void {
    // Append script to document body
    const script = this.renderer2.createElement('script');
    script.type = 'application/javascript';
    script.src = 'https://platform.twitter.com/widgets.js';
    this.renderer2.appendChild(this.htmlDocument.body, script);
  }

  NewComment() {
    this.newComment = true;
    this.newPointComponent.NewPoint(
      '',
      this.constituencyID,
      this.parentPoint.pointID
    );
  }

  CancelComment() {
    this.newComment = false;
  }

  NewCommentCreated() {
    this.newComment = false;
    this.SelectComments();
  }

  onPointDeleted(id: number): void {
    // this.SelectPoints(); No need to reselect.
    // Already deleted from server, now remove from the array
    // https://love2dev.com/blog/javascript-remove-from-array/

    // Update the row number displayed before removing from array
    // get deleted point (array)
    const deleted = this.points.filter(p => p.pointID === id);

    if (!!deleted && deleted.length > 0) {
      // Get deleted question row number
      const pointRowNo = deleted[0].rowNumber;

      // decrement rownumber for all questions above that
      for (var i = 0, len = this.points.length; i < len; i++) {
        if (this.points[i].rowNumber > pointRowNo) this.points[i].rowNumber--;
      }

      for (var i = 0, len = this.IDs.length; i < len; i++) {
        if (this.IDs[i].rowNumber > pointRowNo) this.IDs[i].rowNumber--;
      }
    }

    // Filter out the deleted point
    this.points = this.points.filter(value => value.pointID !== id);

    // Remove id from IDs before getting next batch
    this.IDs = this.IDs.filter(value => value.id != id);

    //ToDo Restore
    // this.pointCount--; // decrement before calling NewPointsDisplayed which updates allPointsDisplayed

    // this.NewPointsDisplayed();
    // this.RemovePointFromAnswers.emit(id);
  }
}
