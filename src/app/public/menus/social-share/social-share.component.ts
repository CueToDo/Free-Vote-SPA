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
  // used in template
  linkShare = '';
  facebookShare = '';
  twitterShare = '';
  linkToAll = '';

  pointTitle = '';
  pointHtml = '';

  get pointTitleEncoded(): string {
    return encodeURIComponent(this.pointTitle);
  }
  get pointText(): string {
    return this.appData.htmlToText(this.pointHtml);
  }

  get pointTextEncoded(): string {
    return encodeURIComponent(this.pointText);
  }

  get linkShareEncoded(): string {
    return encodeURIComponent(this.linkShare);
  }

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
    pointHtml: string,
    slug: string,
    pointID: number
  ): void {
    this.pointTitle = pointTitle;
    this.pointHtml = pointHtml;

    // slug and pointID allow us to build social link back to free.vote post
    this.linkShare =
      this.localData.websiteUrlWTS +
      this.localData.PreviousSlashTagSelected +
      '/';

    // Add slug or pointID to linkShare
    if (!!slug) this.linkShare += slug;
    else this.linkShare += pointID.toString();

    const linkShareEncoded = encodeURIComponent(this.linkShare);

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkShareEncoded}&amp;src=sdkpreparse`;

    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${this.pointTextEncoded}&url=${linkShareEncoded}`;

    this.linkToAll = this.localData.PreviousSlashTagSelected + '/points';

    // Client side scripts
    if (isPlatformBrowser(this.platformId)) {
      FB.XFBML.parse(); // now we can safely call parse method
      this.loadTwitterScript();
    }
  }

  ShareByEmail() {
    window.open(
      `mailto:?subject=${this.pointTitle}&body=Hi,
%0D%0A%0D%0A
Take a look at this from the ${this.localData.website} website - what do you think?
%0D%0A%0D%0A
${this.pointText}
%0D%0A%0D%0A
${this.linkShare}`,
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
