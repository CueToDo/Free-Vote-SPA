// Angular
import {
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

// Models

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { Point } from 'src/app/models/point.model';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.css']
})
export class SocialShareComponent implements OnInit {
  @Input() point = new Point();

  linkShare = '';
  facebookShare = '';
  twitterShare = '';
  linkToAll = '';

  error = '';

  constructor(
    private localData: LocalDataService,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument
  ) {}

  ngOnInit(): void {}

  DisplayShareLinks(): void {
    console.log('WTS:', this.localData.websiteUrlWTS);

    this.linkShare =
      this.localData.websiteUrlWTS.replace(
        'https://localhost:7027',
        'https://free.vote'
      ) +
      this.localData.PreviousSlashTagSelected +
      '/' +
      this.SelectSingleTitle;

    const linkShareEncoded = encodeURIComponent(this.linkShare);
    const titleEncoded = encodeURIComponent(this.point.pointTitle);

    this.facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${linkShareEncoded}&amp;src=sdkpreparse`;
    this.twitterShare = `https://twitter.com/share?ref_src=twsrc%5Etfw&text=${titleEncoded}&url=${linkShareEncoded}`;
    this.linkToAll = this.localData.PreviousSlashTagSelected + '/points';

    // Client side scripts
    if (isPlatformBrowser(this.platformId)) {
      FB.XFBML.parse(); // now we can safely call parse method
      this.loadTwitterScript();
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
