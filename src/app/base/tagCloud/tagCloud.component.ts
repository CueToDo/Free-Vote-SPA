import { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// RxJs
import { Subscription } from 'rxjs';

// Models
import { Tag } from '../../models/tag.model';
import { TagCloudTypes } from '../../models/enums';

// Services
import { AppDataService } from '../../services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { TagsService } from '../../services/tags.service';

@Component({
  selector: 'app-tag-cloud',
  templateUrl: './tagCloud.component.html',
  styleUrls: ['./tagCloud.component.css'],
  preserveWhitespaces: true
})
export class TagCloudComponent implements OnInit, OnDestroy, OnChanges {
  @Input() HasFocus = false;
  @Input() ForConstituency = false;

  private wasForConstituency = false;

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
    private appData: AppDataService,
    private tagsService: TagsService,
    public localData: LocalDataService
  ) {}

  ngOnInit(): void {
    // appComponent monitors width and broadcasts via appDataService
    this.width$ = this.appData.DisplayWidth$.subscribe((widthBand: number) => {
      this.widthBand = widthBand;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Do nothing if we don't have and are not acquiring focus
    const newFocus = changes['HasFocus']?.currentValue;

    if (!this.HasFocus && !newFocus) return;

    // If new focus on this component and we haven't fetched tags
    // or change to local constituency, then fetch tags

    this.FetchTags();
  }

  get ReselectTrending(): boolean {
    if (this.tagCloudType !== TagCloudTypes.Trending) return false;
    if (
      this.wasForConstituency === this.ForConstituency &&
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
      this.wasForConstituency != this.ForConstituency ||
      this.tagsRecent[0].slashTag != this.localData.SlashTagSelected
    )
      return true;

    return false;
  }

  // Do we already have the tags requested?
  public FetchTags(): void {
    if (this.tagSearch) return;
    if (!this.ReselectTrending && !this.ReselectRecent) return;

    this.waiting = true;
    this.tags = [];

    this.tags$ = this.tagsService
      .TagCloud(this.tagCloudType, this.localData.ConstituencyID)
      .subscribe({
        next: response => {
          this.tags = response;
          this.waiting = false;
          this.wasForConstituency = this.ForConstituency;
        },
        error: serverError => {
          this.error = serverError.error.detail;
        }
      });
  }

  FetchTrendingTags() {
    this.tagCloudType = TagCloudTypes.Trending;
    this.appData.RouteParamChange$.next('/trending');
    this.tagSearch = false;

    // Always reselect Trending
    this.FetchTags();
  }

  FetchRecentTags() {
    this.tagCloudType = TagCloudTypes.Recent;
    this.appData.RouteParamChange$.next('/recent');
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
    // Get appDataService to broadcast (method shared by PointEditComponent)
    this.tagsService.SetSlashTag(slashTag);

    // Direct communication to parent - is this needed if parent subscribes to above
    this.NewSlashTagSelected.emit(slashTag);
  }

  TagSearch(): void {
    // Treat as route change - notify app component
    this.appData.RouteParamChange$.next('/tag-search');
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
