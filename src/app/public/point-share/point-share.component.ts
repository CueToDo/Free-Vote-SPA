import { CharacterTheme } from './../../models/break-out-group.model';
import { BreakOutGroupsService } from './../../services/break-out-groups.service';
// Angular
import {
  Component,
  Inject,
  OnInit,
  Renderer2,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { PointsService } from 'src/app/services/points.service';

// Models
import { Point } from 'src/app/models/point.model';
import { PagePreviewMetaData } from 'src/app/models/pagePreviewMetaData.model';
import { BreakoutGroup } from 'src/app/models/break-out-group.model';
import { Kvp } from 'src/app/models/kvp.model';

@Component({
  selector: 'app-point-share',
  templateUrl: './point-share.component.html',
  styleUrls: ['./point-share.component.css']
})
export class PointShareComponent implements OnInit {
  point = new Point();

  slashTag = '';

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

  // Break-out groups
  public breakoutGroups: BreakoutGroup[] = [];
  public breakoutGroupsMessage = '';
  public viewingCurrent = true;
  public joinAnother = false;
  public startingNew = false;
  public rooms: Kvp[] = [];
  public roomSelected = new Kvp();
  public characterThemes: CharacterTheme[] = [];
  public characterThemeSelected: CharacterTheme = new CharacterTheme();

  error = '';
  bogError = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private pointsService: PointsService,
    private breakoutGroupsService: BreakOutGroupsService,
    public localData: LocalDataService, // public - used in template)
    public appData: AppDataService,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {
    const routeParams = this.activeRoute.snapshot.params;
    this.slashTag = routeParams['tag'];
    const pointTitle = routeParams['title'];

    this.SelectSpecificPoint(pointTitle);
    this.breakoutGroupsJoined(true);
  }

  public SelectSpecificPoint(pointTitle: string): void {
    this.alreadyFetchingPointFromDB = true;

    this.pointsService.GetSpecificPoint(this.slashTag, pointTitle).subscribe({
      next: psr => {
        const point = psr.points[0];
        this.point = point;

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
      },
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
    const titleEncoded = encodeURIComponent(this.point.pointTitle);

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

  breakoutGroupsJoined(refresh: boolean): void {
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupMembership(this.slashTag, refresh)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage = 'No break-out groups joined';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.bogError = serverError.error.detail)
      });
  }

  breakoutGroupsAvailable(refresh: boolean): void {
    this.breakoutGroups = [];
    this.breakoutGroupsService
      .GroupsAvailable(this.slashTag, refresh)
      .subscribe({
        next: bogs => {
          if (bogs.length === 0) {
            this.breakoutGroupsMessage =
              'No break-out groups available to join. Consider starting a new group';
          } else {
            this.breakoutGroups = bogs;
          }
        },
        error: serverError => (this.bogError = serverError.error.detail)
      });
  }

  viewMyGroups(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = true;
    this.joinAnother = false;
    this.startingNew = false;
    this.breakoutGroupsJoined(false);
  }

  viewAvailable(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = false;
    this.joinAnother = true;
    this.startingNew = false;
    this.breakoutGroupsAvailable(false);
  }

  startNew(): void {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    this.viewingCurrent = false;
    this.joinAnother = false;
    this.startingNew = true;

    this.roomSelected = new Kvp();
    this.characterThemeSelected = {
      breakoutGroupThemeID: -1,
      themeName: '',
      characters: 0
    };

    this.breakoutGroupsService.BreakoutRooms(this.slashTag).subscribe({
      next: rooms => {
        this.rooms = rooms;
        console.log(rooms);
      },
      error: serverError => (this.bogError = serverError.error.detail)
    });

    this.breakoutGroupsService
      .CharacterThemes()
      .subscribe({ next: themes => (this.characterThemes = themes) });
  }

  groupStart() {
    this.breakoutGroupsMessage = '';
    this.bogError = '';
    if (!this.roomSelected.value || this.roomSelected.value < 1) {
      this.bogError = 'please select a room';
    } else if (
      !this.characterThemeSelected ||
      this.characterThemeSelected.breakoutGroupThemeID < 1
    ) {
      this.bogError = 'please select a character theme';
    } else {
      this.breakoutGroupsService
        .GroupStart(
          this.slashTag,
          this.roomSelected.value,
          this.characterThemeSelected.breakoutGroupThemeID
        )
        .subscribe({
          next: _ => {
            this.breakoutGroupsJoined(true);
            this.viewMyGroups();
          },
          error: serverError => (this.bogError = serverError.error.detail)
        });
    }
  }

  groupJoin(groupID: number) {
    var group = this.breakoutGroups.filter(
      group => group.breakoutGroupID === groupID
    );
    if (!!group && group.length > 0) {
      if (!group[0].member) {
        this.breakoutGroupsService.GroupJoin(groupID).subscribe({
          next: _ => this.refresh(),
          error: serverError => (this.bogError = serverError.error.detail)
        });
      }
    }
  }

  refresh() {
    this.breakoutGroupsJoined(true);
    this.viewMyGroups();
  }
}
