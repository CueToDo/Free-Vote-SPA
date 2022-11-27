// Angular
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { tap } from 'rxjs';

// Models
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
import { SocialShareComponent } from '../menus/social-share/social-share.component';

@Component({
  selector: 'app-point-comments',
  templateUrl: './point-comments.component.html',
  styleUrls: ['./point-comments.component.css']
})
export class PointCommentsComponent implements OnInit {
  @Input() feedbackOn = true;
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('trvParentPoint') parentPointComponent!: PointComponent;
  @ViewChild('socialShare') socialShareComponent!: SocialShareComponent;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  initialised = false;
  parentPoint = new Point();
  ancestors: Point[] = [];
  points: Point[] = [];
  public IDs: ID[] = [];

  // bind to point slashtags (not topic)
  slashTags: string[] = []; // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];
  youTubeIDs: string[] = [];
  vimeoIDs: string[] = [];
  soundCloudTrackIDs: string[] = [];
  pointHTMLwithoutEmbed = '';

  newComment = false;

  get constituencyID(): number {
    return this.localData.ConstituencyIDVoter;
  }

  alreadyFetchingPointFromDB = false;

  error = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pointsService: PointsService,
    public localData: LocalDataService, // public - used in template)
    public appData: AppDataService
  ) {}

  ngOnInit(): void {
    const routeParams = this.activatedRoute.snapshot.params;

    const slashTag = routeParams['tag'];
    const pointTitle = routeParams['title'];

    this.SelectSpecificPoint(slashTag, pointTitle);

    // The ActivatedRoute dies with the routed component and so
    // the subscription dies with it.
    this.activatedRoute.paramMap.subscribe(params => {
      if (this.initialised) {
        const pointTitle = params.get('title');
        if (!!pointTitle) this.SelectSpecificPoint(slashTag, pointTitle);
      }
    });
  }

  // Select point from title in route
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
          this.AssignPoint(psr.points[0]);
          // will return original psr from GetSpecificPoint
        })
      )
      .subscribe(_ => {
        this.initialised = true;
      }); // no need to do anything
  }

  // Select Specific Point from pointID
  SelectComment(pointID: number): void {
    this.alreadyFetchingPointFromDB = true;

    this.pointsService
      .GetComment(this.localData.ConstituencyIDVoter, pointID) // Returns a PointSelectionResult
      .pipe(
        tap(psr => {
          this.AssignPoint(psr.points[0]);
          // will return original psr from GetSpecificPoint
        })
      )
      .subscribe(_ => {
        this.initialised = true;
      }); // no need to do anything
  }

  AssignPoint(point: Point) {
    this.parentPoint = point; // Change detection is not working immediately here.
    // PointComponent does not receive the update automatically
    // Manually pass the value just received and initialise the component
    this.parentPointComponent.AssignAndInitialise(point);

    this.socialShareComponent.DisplayShareLinks();

    // SSR Initial page render
    const preview = {
      pagePath: this.router.url,
      title: point.pointTitle,
      description: point.preview,
      image: point.previewImage
    } as PagePreviewMetaData;

    // Notify app.component to set meta data for SEO & Social scraping
    this.appData.SSRInitialMetaData$.next(preview);

    // now we have pointID, select ancestors and comments
    this.SelectAncestors(); // doesn't return anything
    this.SelectComments(); // doesn't return anything
  }

  SelectAncestors() {
    this.pointsService
      .PointCommentAncestors(
        this.parentPoint.pointID,
        this.localData.ConstituencyIDVoter
      )
      .subscribe({
        next: psr => (this.ancestors = psr.points),
        error: err => {
          this.error = err.error.detail;
        },
        complete: () => {}
      });
  }

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

  NewComment() {
    this.newComment = true;
    this.newPointComponent.NewPoint(
      '',
      this.constituencyID,
      this.parentPoint.pointID
    );
    setTimeout(() => this.scrollToBottom(), 100);
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

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  scrollToTop() {
    this.scrollContainer.nativeElement.scrollTop = 0;
  }
}
