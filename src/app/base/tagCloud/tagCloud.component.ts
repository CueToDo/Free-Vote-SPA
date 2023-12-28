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
  @Input() forConstituency = false;

  private wasForConstituency = false;

  @Output() haveTags = new EventEmitter<boolean>();
  @Output() NewSlashTagSelected = new EventEmitter<string>();

  TagCloudTypes = TagCloudTypes;

  tags: Tag[] = [];
  tagsSave: Tag[] = [];
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
    if (this.waiting) return;

    const newFocus = changes['HasFocus']?.currentValue;
    if (!this.HasFocus && !newFocus) return; // Do nothing if we don't have and not acquiring focus

    const newForConstituency = changes['forConstituency']?.currentValue;

    // If new focus on this component and we haven't fetched tags
    // or change to local constituency, then fetch tags
    if (
      (newFocus && (!this.tags || this.tags.length == 0)) ||
      newForConstituency != null ||
      this.wasForConstituency != this.forConstituency
    ) {
      this.FetchTags();
    }
  }

  // Do we already have the tags requested?
  public FetchTags(): void {
    if (this.tagSearch) return;
    this.waiting = true;
    this.tags = [];

    this.tags$ = this.tagsService
      .TagCloud(this.localData.tagCloudType, this.localData.ConstituencyID)
      .subscribe({
        next: response => {
          this.tags = response;
          this.tagsSave = response;
          this.waiting = false;
          this.wasForConstituency = this.forConstituency;
          this.haveTags.emit(response && response.length > 0);
        },
        error: serverError => {
          this.error = serverError.error.detail;
        }
      });
  }

  FetchTrendingTags() {
    this.localData.tagCloudType = TagCloudTypes.Trending;
    this.appData.RouteParamChange$.next('/trending');
    this.tagSearch = false;
    this.FetchTags();
  }

  FetchRecentTags() {
    this.localData.tagCloudType = TagCloudTypes.Recent;
    this.appData.RouteParamChange$.next('/recent');
    this.tagSearch = false;
    this.FetchTags();
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
    this.tags = this.tagsSave;
  }

  ngOnDestroy(): void {
    this.tags$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
