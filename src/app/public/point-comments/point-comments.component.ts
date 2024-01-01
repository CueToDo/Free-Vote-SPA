// Angular
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { tap } from 'rxjs';

// Models/Enums
import { Point } from 'src/app/models/point.model';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';
import { PointSelectionTypes } from 'src/app/models/enums';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { PointsService } from 'src/app/services/points.service';

// Components
import { PointComponent } from '../point/point.component';
import { PointEditComponent } from '../point-edit/point-edit.component';
import { SocialShareComponent } from '../menus/social-share/social-share.component';
import { PointsListComponent } from '../points-list/points-list.component';

@Component({
  selector: 'app-point-comments',
  templateUrl: './point-comments.component.html',
  styleUrls: ['./point-comments.component.css']
})
export class PointCommentsComponent implements OnInit {
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('trvParentPoint') parentPointComponent!: PointComponent;
  @ViewChild('socialShare') socialShareComponent!: SocialShareComponent;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('appPointsList') childComments!: PointsListComponent;

  initialised = false;

  parentPoint = new Point();

  get ParentPointID(): number {
    return this.parentPoint.pointID;
  }

  ancestors: Point[] = [];

  gettingAncestors = false;
  gettingMainPoint = false;
  gettingChildren = false;

  // bind to point slashtags (not topic)
  slashTags: string[] = []; // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];
  vimeoIDs: string[] = [];
  soundCloudTrackIDs: string[] = [];
  pointHTMLwithoutEmbed = '';

  newComment = false;

  get constituencyID(): number {
    return this.localData.ConstituencyIDVoter;
  }

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

    this.SelectMainPointByTag(slashTag, pointTitle);
  }

  // Select specific point from title in route
  public SelectMainPointByTag(slashTag: string, pointTitle: string): void {
    this.gettingMainPoint = true;

    this.pointsService
      .GetSpecificPoint(this.localData.ConstituencyID, slashTag, pointTitle) // Returns a PointSelectionResult
      .pipe(
        tap(psr => {
          this.AssignPoint(psr.points[0]);
          // will return original psr from GetSpecificPoint
        })
      )
      .subscribe(_ => {
        this.initialised = true;
        this.gettingMainPoint = false;
      }); // no need to do anything
  }

  // Select specific Point from pointID (make a parent point or a child comment the main point)
  SelectMainPointByID(pointID: number): void {
    this.gettingMainPoint = true;

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
        this.gettingMainPoint = false;
      }); // no need to do anything
  }

  AssignPoint(point: Point) {
    this.parentPoint = point; // Change detection is not working immediately here.
    // PointComponent does not receive the update automatically
    // Manually pass the value just received and initialise the component
    this.parentPointComponent.AssignAndInitialise(point);

    this.socialShareComponent.DisplayShareLinksInBrowserFromPoint(point);

    // now we have pointID, select ancestors and comments
    this.SelectAncestors(); // doesn't return anything
    this.childComments.SelectPoints();
  }

  SelectAncestors() {
    this.gettingAncestors = true;
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
        complete: () => {
          this.gettingAncestors = false;
        }
      });
  }

  NewComment() {
    this.newComment = true;
    this.newPointComponent.PrepareNewPoint('', this.parentPoint.pointID);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  CancelComment() {
    this.newComment = false;
  }

  NewCommentCreated() {
    this.newComment = false;
    this.childComments.SelectPoints();
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

  setSlashTag(slashTag: string) {
    this.router.navigate([`${slashTag}/points`]);
  }
}
