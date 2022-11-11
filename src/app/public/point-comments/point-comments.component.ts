import { concatMap } from 'rxjs/operators';
// Angular
import {
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

//Models
import { Point } from 'src/app/models/point.model';
import { PagePreviewMetaData } from 'src/app/models/pagePreviewMetaData.model';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { PointsService } from 'src/app/services/points.service';

@Component({
  selector: 'app-point-comments',
  templateUrl: './point-comments.component.html',
  styleUrls: ['./point-comments.component.css']
})
export class PointCommentsComponent implements OnInit {
  parentPoint = new Point();
  points: Point[] = [];

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
      )
      .pipe(
        concatMap(psr => {
          const point = psr.points[0];
          this.parentPoint = point;

          this.extractMediaEmbeds();
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
          return this.pointsService.PointsSelectComments(
            point.pointID,
            this.localData.ConstituencyIDVoter
          );
        })
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

  // gawd a copy and paste job
  extractMediaEmbeds(): void {
    // https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html

    if (!this.parentPoint) {
      this.error = 'Missing: point';
    } else {
      this.youTubeIDs = [];
      if (this.parentPoint.youTubeID) {
        this.youTubeIDs.push(this.parentPoint.youTubeID);
      }

      this.soundCloudTrackIDs = [];
      if (this.parentPoint.soundCloudTrackID) {
        this.soundCloudTrackIDs.push(this.parentPoint.soundCloudTrackID);
      }

      this.vimeoIDs = [];

      const split = this.parentPoint.pointHTML.split('<figure class="media">');

      if (split.length > 0) {
        let i: number;
        let oembedPlus: string[];
        let url: string;
        let id = '';
        let urlParts = [];
        let lastPart = '';
        let timeSplit = [];
        let start = '';

        for (i = 1; i < split.length; i++) {
          oembedPlus = split[i].split('</figure>');
          url = oembedPlus[0].split('"')[1];
          urlParts = url.split('/');
          lastPart = urlParts[urlParts.length - 1]; // watch?v=Ef9QnZVpVd8&amp;t=49s

          if (url.includes('youtu.be')) {
            id = lastPart;
            this.youTubeIDs.push(id);
          } else if (url.includes('youtube.com')) {
            id = lastPart.split('v=')[1]; // Ef9QnZVpVd8 &amp;t= 49s

            timeSplit = id.split('&amp;t='); // Ef9QnZVpVd8 49s
            if (timeSplit.length > 1) {
              start = timeSplit[1].replace('s', ''); // 49
              id = `${timeSplit[0]}?start=${start}`; // Ef9QnZVpVd8?start=49
            }
            this.youTubeIDs.push(id);
          } else if (url.includes('vimeo.com')) {
            id = lastPart;
            this.vimeoIDs.push(id);
          } else if (url.includes('soundcloud')) {
          }

          split[i] = oembedPlus[1]; // Use only what's after the figure element
        }
      }

      this.pointHTMLwithoutEmbed = split.join(''); // pointHTML stripped of <figure> elements added by ckEditor for media embed
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
  }

  CancelComment() {
    this.newComment = false;
  }

  NewCommentCreated() {
    this.newComment = false;
  }
}
