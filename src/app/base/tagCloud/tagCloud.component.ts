// Angular
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

// RxJs
import { Subscription } from 'rxjs';

// Models
import { Tag } from '../../models/tag.model';
import { TagCloudTypes } from '../../models/enums';

// Services
import { AppService } from '../../services/app.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { TagsService } from '../../services/tags.service';
import { TagDisplayPipe } from '../../custommodule/pipes/tag-display.pipe';
import { TagSearchComponent } from '../tag-search/tag-search.component';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { BasicService } from 'src/app/services/basic.service';

@Component({
  selector: 'app-tag-cloud',
  templateUrl: './tagCloud.component.html',
  styleUrls: ['./tagCloud.component.css'],
  preserveWhitespaces: true,
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    NgIf,
    TagSearchComponent,
    NgFor,
    NgStyle,
    TagDisplayPipe
  ]
})
export class TagCloudComponent implements OnInit, OnDestroy, OnChanges {
  @Input() HasFocus = false;
  @Input() ForConstituency = false;

  private wasForConstituencyTrending = false;
  private wasForConstituencyRecent = false;

  private set wasForConstituency(value: boolean) {
    if (this.tagCloudType === TagCloudTypes.Trending)
      this.wasForConstituencyTrending = value;
    else if (this.tagCloudType === TagCloudTypes.Recent)
      this.wasForConstituencyRecent = value;
  }

  @Output() NewSlashTagSelected = new EventEmitter<string>();

  TagCloudTypes = TagCloudTypes;
  tagCloudType = TagCloudTypes.Trending;

  tagsRecent: Tag[] = []; // Saved - won't necessarily be refreshed
  tagsTrending: Tag[] = []; // Will always be refreshed

  public get tags(): Tag[] {
    if (this.tagCloudType === TagCloudTypes.Recent) return this.tagsRecent;
    return this.tagsTrending;
  }

  private set tags(value: Tag[]) {
    if (this.tagCloudType === TagCloudTypes.Recent) this.tagsRecent = value;
    else this.tagsTrending = value;
  }

  tagSearch = false;

  waiting = false;
  hideTags = false;
  toggleText = 'hide tags';

  tags$?: Subscription;

  // Viewport width monitoring
  width$?: Subscription;
  widthBand = 4;

  error = '';

  constructor(
    private appService: AppService,
    private basicService: BasicService,
    private tagsService: TagsService,
    public localData: LocalDataService
  ) {}

  ngOnInit(): void {
    // appComponent monitors width and broadcasts via appServiceService
    this.width$ = this.appService.DisplayWidth$.subscribe(
      (widthBand: number) => {
        this.widthBand = widthBand;
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Do nothing if we don't have and are not acquiring focus and constituency hasn't changed
    const newFocus = changes['HasFocus']?.currentValue;
    const newConstituency = changes['ForConstituency']?.currentValue;

    if (!this.HasFocus && !newFocus && !newConstituency == undefined) return;

    // If new focus on this component and we haven't fetched tags
    // or change to local constituency, then fetch tags

    this.FetchTags();
  }

  get ReselectTrending(): boolean {
    if (this.tagCloudType !== TagCloudTypes.Trending) return false;
    if (
      this.wasForConstituencyTrending === this.ForConstituency &&
      this.tagsTrending.length != 0
    )
      return false;
    return true;
  }

  // Do we need to go to database to reselect voter's recent tag list?
  get ReselectRecent(): boolean {
    if (this.tagCloudType !== TagCloudTypes.Recent) return false;

    if (
      this.tagsRecent.length == 0 ||
      this.wasForConstituencyRecent != this.ForConstituency ||
      this.tagsRecent[0].slashTag != this.localData.SlashTagSelected
    )
      return true;

    return false;
  }

  RouteParameterChange(route: string) {
    this.appService.RouteParamChange$.next(
      route + this.localData.ConstituencyKebabSlash
    );
  }

  // Do we already have the tags requested?
  public FetchTags(): void {
    if (this.tagSearch) return;
    if (!this.ReselectTrending && !this.ReselectRecent) return;

    this.waiting = true;
    this.tags = [];
    this.error = '';

    this.tags$ = this.tagsService
      .TagCloud(this.tagCloudType, this.localData.ConstituencyID)
      .subscribe({
        next: response => {
          this.tags = response;
          this.waiting = false;
          this.wasForConstituency = this.ForConstituency;
        },
        error: serverError => {
          this.error = this.basicService.getError(serverError);
          this.waiting = false;
        }
      });
  }

  FetchTrendingTags() {
    this.tagCloudType = TagCloudTypes.Trending;
    this.RouteParameterChange('/trending');
    this.tagSearch = false;

    // Always reselect Trending
    this.FetchTags();
  }

  FetchRecentTags() {
    this.tagCloudType = TagCloudTypes.Recent;
    this.RouteParameterChange('/recent');
    this.tagSearch = false;

    // Check if we need to reselect recent
    if (this.ReselectRecent) this.FetchTags();
  }

  FontSize(Weight: number): string {
    // Restrict Weight and font-size for smaller screens

    if (this.widthBand < 1 && Weight > 0) {
      Weight = 0;
    } else if (this.widthBand < 2 && Weight > 1) {
      Weight = 1;
    } else if (this.widthBand < 3 && Weight > 2) {
      Weight = 2;
    } else if (this.widthBand < 4 && Weight > 3) {
      Weight = 3;
    } else if (this.widthBand < 5 && Weight > 4) {
      Weight = 4;
    } else if (Weight > 5) {
      Weight = 5;
    }

    return 100 + Weight * 25 + '%'; // perCent
  }

  setSlashTag(slashTag: string): void {
    // Get appServiceService to broadcast (method shared by PointEditComponent)
    this.tagsService.SetSlashTag(slashTag);

    // Direct communication to parent - is this needed if parent subscribes to above
    this.NewSlashTagSelected.emit(slashTag);
  }

  TagSearch(): void {
    // Treat as route change - notify app component
    this.RouteParameterChange('/tag-search');
    this.tagSearch = true;
    this.tags = [];
  }

  TagSearchResult(tags: Tag[]): void {
    this.tags = tags;
  }

  CancelTagSearch(): void {
    this.tagSearch = false;
  }

  ngOnDestroy(): void {
    this.tags$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
