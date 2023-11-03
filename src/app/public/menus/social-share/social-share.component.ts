import { AppDataService } from 'src/app/services/app-data.service';
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

// Services
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.css']
})
export class SocialShareComponent implements OnInit {
  pointTitle = '';
  slug = '';
  pointID = 0;

  linkShare = '';
  facebookShare = '';
  twitterShare = '';
  linkToAll = '';

  error = '';

  constructor(
    private appData: AppDataService,
    private localData: LocalDataService,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private htmlDocument: Document
  ) {}

  ngOnInit(): void {}

  DisplayShareLinks(
    pointTitle: string,
    pointText: string,
    slug: string,
    pointID: number
  ): void {
    this.pointTitle = pointTitle;
    this.slug = slug;
    this.pointID = pointID;

    this.linkShare =
      this.localData.websiteUrlWTS.replace(
        'https://localhost:7027',
        'https://free.vote'
      ) +
      this.localData.PreviousSlashTagSelected +
      '/' +
      this.SelectSingleTitle;

    const linkShareEncoded = encodeURIComponent(this.linkShare);

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkShareEncoded}&amp;src=sdkpreparse`;
    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${this.appData.htmlToText(
      pointText
    )}&url=${linkShareEncoded}`;
    this.linkToAll = this.localData.PreviousSlashTagSelected + '/points';

    // Client side scripts
    if (isPlatformBrowser(this.platformId)) {
      FB.XFBML.parse(); // now we can safely call parse method
      this.loadTwitterScript();
    }
  }

  // PointTitle or PointID to be able to select single point
  get SelectSingleTitle(): string {
    if (!!this.slug) {
      return this.slug;
    } else {
      return this.pointID.toString();
    }
  }

  ShareByEmail() {
    window.open(
      `mailto:?subject=${this.pointTitle}&body=Hi,%0D%0A%0D%0ATake a look at this from the ${this.localData.website} website - what do you think?%0D%0A%0D%0A${this.linkShare}`,
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
