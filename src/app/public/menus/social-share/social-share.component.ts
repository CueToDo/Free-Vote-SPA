// Angular
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

// Models
import { Point } from 'src/app/models/point.model';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { ActivatedRoute } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.css']
})
export class SocialShareComponent implements OnInit {
  url = '';

  // used by ShareByEmail - not encoded
  shareTitle = '';
  sharePreview = '';
  shareImage = '';
  routeToSharedPoint = '';
  linkToSharedPoint = '';
  linkToSharedPointWithSSRQueryParams = '';

  // used in template
  facebookShare = '';
  twitterShare = '';
  linkBackToAllPoints = '';

  error = '';

  constructor(
    private localData: LocalDataService,
    private appData: AppDataService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private htmlDocument: Document
  ) {
    this.routeToSharedPoint = this.activatedRoute.snapshot.url.join('/');
    this.linkBackToAllPoints = `/${this.activatedRoute.snapshot.url[0]}/points`;
    this.linkToSharedPoint = `${this.localData.websiteUrlWTS}/${this.routeToSharedPoint}`;
  }

  ngOnInit(): void {
    this.SetMetaData();
  }

  SetMetaData() {
    // Route Parameter snapshot for SSR point meta data

    const routeParams = this.activatedRoute.snapshot.params;

    this.shareTitle = routeParams['shareTitle'] + '';
    this.sharePreview = routeParams['sharePreview'] + '';
    this.shareImage = routeParams['shareImage'] + '';

    // Setting meta data on SSR app.component init
    // will be of use to social media sites as well as Google

    // Runs in app component init in SSR for FCP (First Contentful Paint)

    this.appData.setMetaData(
      this.localData.websiteUrlWTS,
      this.shareTitle,
      this.sharePreview,
      this.shareImage
    );
  }

  DisplayShareLinks(point: Point): void {
    // Basic Title and Text
    if (!!point.pointTitle)
      this.shareTitle = point.pointTitle; // Required separately by ShareByEmail
    else this.shareTitle = point.linkTitle;

    // Only add the preview if it does not contain a link to another website
    if (point.preview.indexOf('http') == 0) this.sharePreview = point.preview;
    // Is only text - not images or links, no need to sanitise further or strip to 160 characters
    else this.sharePreview = point.linkDescription;

    if (!!point.previewImage) {
      this.shareImage = `${this.localData.websiteUrlWTS}/${point.previewImage}`;
    } else this.shareImage = point.linkImage;

    // Encode to build linkToSharedPoint
    var pointTitleEncoded = encodeURIComponent(this.shareTitle);
    var pointTextPreviewEncoded = encodeURIComponent(this.sharePreview);
    var imageEncoded = encodeURIComponent(this.shareImage);

    // Add query parameters to linkShare to allow app component to build meta data on server
    // (SSR does not do any async ops like database access)
    this.linkToSharedPointWithSSRQueryParams = `${this.linkToSharedPoint}/${pointTitleEncoded}/${pointTextPreviewEncoded}/${imageEncoded}`;

    const linkToPointEncoded = encodeURIComponent(
      this.linkToSharedPointWithSSRQueryParams
    );

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkToPointEncoded}&amp;src=sdkpreparse`;

    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${this.sharePreview}&url=${linkToPointEncoded}`;

    // Client side scripts
    if (isPlatformBrowser(this.platformId)) {
      FB.XFBML.parse(); // now we can safely call parse method
      this.loadTwitterScript();
    }
  }

  ShareByEmail() {
    window.open(
      `mailto:?subject=${this.shareTitle}&body=Hi,
%0D%0A%0D%0A
Take a look at this from the ${this.localData.website} website - what do you think?
%0D%0A%0D%0A
${this.sharePreview}
%0D%0A%0D%0A
${this.linkToSharedPoint}`,
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
