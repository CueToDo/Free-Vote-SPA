import { OnDestroy } from '@angular/core';
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
export class TagCloudComponent implements OnInit, OnDestroy {
  @Input() tagCloudType = TagCloudTypes.Trending;

  @Output() haveTags = new EventEmitter<boolean>();
  @Output() NewSlashTagSelected = new EventEmitter<string>();

  constituencyID = 0;
  tags: Tag[] = [];

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
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    // appComponent monitors width and broadcasts via appDataService
    this.width$ = this.appData.DisplayWidth$.subscribe((widthBand: number) => {
      this.widthBand = widthBand;
    });
  }

  public FetchTagsForConstituency(constituencyID: number) {
    this.waiting = true;
    this.tags = [];
    this.constituencyID = constituencyID;
    this.FetchTags();
  }

  public FetchTags(): void {
    this.tags$ = this.tagsService
      .TagCloud(this.tagCloudType, this.constituencyID)
      .subscribe({
        next: response => {
          this.tags = response;
          this.waiting = false;
          this.haveTags.emit(response && response.length > 0);
        },
        error: serverError => {
          this.error = serverError.error.detail;
        }
      });
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

    return 100 + Weight * 50 + '%'; // perCent
  }

  setSlashTag(slashTag: string): void {
    // Get appDataService to broadcast (method shared by PointEditComponent)
    this.tagsService.SetSlashTag(slashTag);

    // Direct communication to parent - is this needed if parent subscribes to above
    this.NewSlashTagSelected.emit(slashTag);
  }

  ngOnDestroy(): void {
    this.tags$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
