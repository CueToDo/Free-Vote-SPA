import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Point, PointSelectionResult } from 'src/app/models/point.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { PointsService } from 'src/app/services/points.service';
import { PagePreviewMetaData } from 'src/app/models/point.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-point-share',
  templateUrl: './point-share.component.html',
  styleUrls: ['./point-share.component.css']
})
export class PointShareComponent implements OnInit {
  point = new Point();

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

  alreadyFetchingPointFromDB = false;

  error = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private pointsService: PointsService,
    public localData: LocalDataService, // public - used in template)
    public appData: AppDataService,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {
    const routeParams = this.activeRoute.snapshot.params;
    const slashTag = routeParams.tag;
    const pointTitle = routeParams.title;

    this.SelectSpecificPoint(slashTag, pointTitle);
  }

  public SelectSpecificPoint(slashTag: string, pointTitle: string): void {
    this.alreadyFetchingPointFromDB = true;

    this.pointsService.GetSpecificPoint(slashTag, pointTitle).subscribe({
      next: psr => {
        this.DisplayPoint(psr);

        // SSR Initial page render
        if (!this.appData.initialPageRendered) {
          const point = psr.points[0];

          const preview = {
            pagePath: this.router.url,
            title: point.pointTitle,
            preview: point.preview,
            previewImage: point.previewImage
          } as PagePreviewMetaData;

          this.appData.PagePreview$.next(preview);
        }
      },
      error: err => {
        this.error = err.error.detail;
        this.alreadyFetchingPointFromDB = false;
      }
    });
  }

  DisplayPoint(psr: PointSelectionResult): void {
    this.alreadyFetchingPointFromDB = false;

    this.point = psr.points[0];

    console.log(this.point);

    this.linkToAll = this.localData.PreviousSlashTagSelected + '/points';

    this.linkShare =
      this.localData.websiteUrlWTS.replace(
        'http://localhost:7027',
        'https://free.vote'
      ) +
      this.localData.PreviousSlashTagSelected +
      '/' +
      this.SelectSingleTitle;

    const linkShareEncoded = encodeURIComponent(this.linkShare);
    const titleEncoded = encodeURIComponent(this.point.pointTitle);

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkShareEncoded}&amp;src=sdkpreparse`;

    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${titleEncoded}&url=${linkShareEncoded}`;

    this.extractMediaEmbeds();

    this.alreadyFetchingPointFromDB = false;

    FB.XFBML.parse(); // now we can safely call parse method

    this.loadTwitterScript();
  }

  // PointTitle or PointID to be able to select single point
  get SelectSingleTitle(): string {
    if (!this.point) {
      this.error = 'Missing: point';
      return '';
    } else {
      if (!!this.point.pointLink) {
        return this.point.pointLink;
      } else {
        return this.point.pointID.toString();
      }
    }
  }

  // gawd a copy and paste job
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
    }
  }

  ShareByEmail() {
    window.open(
      `mailto:?subject=${this.point.pointTitle}&body=Hi,%0D%0A%0D%0ATake a look at this from the ${this.localData.website} website - what do you think?%0D%0A%0D%0A${this.linkShare}`,
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
}
