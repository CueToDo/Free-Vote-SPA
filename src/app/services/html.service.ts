// Angular
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Services
import { BasicService } from './basic.service';

// Other
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HtmlService {
  public keywords =
    'Free Vote, Free, Vote, anonymous, voting, platform, democracy';

  constructor(
    private basicService: BasicService,
    private metaService: Meta,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  // Used by Social Share component only
  public setMetaData(
    websiteWTS: string,
    shareTitle: string,
    sharePreview: string,
    shareImage: string
  ): void {
    // Pointless updating meta data on client browser
    if (isPlatformBrowser(this.platformId)) return;

    // https://www.tektutorialshub.com/angular/meta-service-in-angular-add-update-meta-tags-example/
    // https://css-tricks.com/essential-meta-tags-social-media/

    // Requires Angular Universal Server Side Rendering for Social media use
    // https://stackoverflow.com/questions/45262719/angular-4-update-meta-tags-dynamically-for-facebook-open-graph

    const pagePath = this.router.url; /* page path (home) */

    // Don't overwrite existing meta with home meta
    if (
      shareTitle === websiteWTS &&
      !!this.metaService.getTag(`property='og:title'`)
    )
      return;

    // 1) Title: remove and conditionally add
    this.metaService.removeTag(`property='og:title'`);
    this.metaService.removeTag(`name='twitter:title'`);

    if (shareTitle) {
      this.metaService.addTags([
        { property: 'og:title', content: shareTitle },
        { name: 'twitter:title', content: shareTitle }
      ]);
    }

    // 2) Description preview
    this.metaService.updateTag({
      name: 'description',
      content: sharePreview
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: sharePreview
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: sharePreview
    });

    // 4) og:url remove and conditionally add
    this.metaService.removeTag(`property='og:url'`);

    const url = `${websiteWTS}/${this.basicService.removeBookEnds(
      pagePath,
      '/'
    )}`;

    if (url) {
      this.metaService.addTags([{ property: 'og:url', content: url }]);
    }

    // 5) og:type
    this.metaService.updateTag({ property: 'og:type', content: 'article' });

    // 6) twitter:card
    // card type: “summary”, “summary_large_image”, “app”, or “player”.
    this.metaService.removeTag(`name='twitter:card'`);

    if (sharePreview && shareImage) {
      this.metaService.addTags([
        { name: 'twitter:card', content: 'summary_large_image' }
      ]);
    } else if (sharePreview) {
      this.metaService.addTag({ name: 'twitter:card', content: 'summary' });
    }

    // 7) PreviewImage remove and conditionally add
    this.metaService.removeTag(`property='og:image'`);
    this.metaService.removeTag(`property='og:image:width'`);
    this.metaService.removeTag(`property='og:image:height'`);
    this.metaService.removeTag(`name='twitter:image'`);

    if (!!shareImage) {
      this.metaService.addTags([
        { property: 'og:image', content: shareImage },
        { name: 'twitter:image', content: shareImage }
      ]);
    } else {
      this.metaService.addTags([
        {
          property: 'og:image',
          content: websiteWTS + '/assets/vulcan-384.png'
        },
        { property: 'og:image:width', content: '384' },
        { property: 'og:image:height', content: '384' },
        {
          name: 'twitter:image',
          content: websiteWTS + '/assets/vulcan-384.png'
        }
      ]);
    }

    // 8) Facebook app_id
    this.metaService.updateTag({
      property: 'fb:app_id',
      content: environment.facebookAppId
    });
  }

  htmlToText(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract the plain text content of the document body.
    let text = doc.body.textContent + '';
    text = text.replace('https://', ' https://');
    return text;
  }

  public unhideLinks(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchorElements = Array.from(doc.querySelectorAll('a'));
    for (const anchor of anchorElements) {
      const classes = anchor.classList;
      classes.remove('hidden');
    }
    return doc.body.innerHTML;
  }

  SpanHasStyle(html: string): boolean {
    let hasStyle = false;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const spans = Array.from(doc.querySelectorAll('span'));

    for (const span of spans) {
      if (span.hasAttribute('style')) {
        hasStyle = true;
        break;
      }
    }

    return hasStyle;
  }

  RemoveSpansWithStyle(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const spans = Array.from(doc.querySelectorAll('span'));

    for (const span of spans) {
      span.outerHTML = span.innerHTML;
    }

    return doc.body.innerHTML;
  }
}
