import { Observable } from 'rxjs';
// Angular
import {
  AfterViewInit,
  Component,
  NgZone,
  OnInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  EventEmitter,
  Output
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

// rxjs
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// FreeVote Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from './../../services/local-data.service';
import { TagsService } from 'src/app/services/tags.service';

// Other
import { DeviceDetectorService } from 'ngx-device-detector';
import { Tag } from 'src/app/models/tag.model';

@Component({
  selector: 'app-tag-search',
  templateUrl: './tag-search.component.html',
  styleUrls: ['./tag-search.component.css']
})
export class TagSearchComponent implements OnInit, AfterViewInit {
  @Output() NewSlashTagSelected = new EventEmitter<string>();

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  @ViewChild('tvSlashTag', { static: false }) tvSlashTag:
    | ElementRef
    | undefined;

  slashTag = '';
  tagSearch$: Subscription | undefined;
  tagResults$: Subscription | undefined;
  tags: Tag[] = [];
  searching = false;

  isMobile = false;
  error = '';

  // Viewport width monitoring
  width$?: Subscription;
  widthBand = 4;

  constructor(
    private ngZone: NgZone,
    public appData: AppDataService,
    public localData: LocalDataService,
    private tagsService: TagsService,
    private deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.epicFunction();

    // appComponent monitors width and broadcasts via appDataService
    this.width$ = this.appData.DisplayWidth$.subscribe((widthBand: number) => {
      this.widthBand = widthBand;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // 2-way databinding already cleans up the slashtag
    // This is just for delayed search
    this.ngZone.runOutsideAngular(() => {
      this.tagSearch$ = fromEvent<KeyboardEvent>(
        this.tvSlashTag?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: _ => {
            // Fuzzy search on userInput
            this.tagSearch(); // "As-is"
          }
        });
    });
  }

  epicFunction(): void {
    this.isMobile = this.deviceService.isMobile();
  }

  public restartSearch(): void {
    // Client side only
    if (isPlatformBrowser(this.platformId)) {
      this.slashTag = '/';
      this.tags = [];

      window.setTimeout(() => {
        // Set focus on input
        const el = this.tvSlashTag?.nativeElement;
        el?.focus();
        // Place cursor at end
        if (typeof el.selectionStart === 'number') {
          el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange !== 'undefined') {
          const range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
      }, 500);
    }
  }

  slashTagCleanUp(input: string): void {
    if (!input) {
      this.slashTag = '/';
      return;
    }

    // legal: dash space, alphanumeric
    const regx = /[- A-Za-z0-9]/;

    let output = '';
    let last = '';

    for (let c of input) {
      c = c.replace(' ', '-');
      if (!(c === '-' && last === '-') && regx.test(c)) {
        output += c;
      }
      last = c;
    }

    if (output.startsWith('-')) {
      output = output.slice(1);
    }

    this.slashTag = '/' + output;
    // This does not get communicated back to view until no cleanup is required
  }

  // Go to API to get matching tags after debouncing keyups
  tagSearch() {
    this.searching = true;
    //min 2 consonants to search api
    if (this.appData.uniqueConsonants(this.slashTag) > 1) {
      this.tagResults$ = this.tagsService.TagSearch(this.slashTag).subscribe({
        next: slashTags => {
          this.tags = slashTags;
          this.searching = false;
        },
        error: serverError => {
          this.error = serverError.console.error.detail;
          this.searching = false;
        }
      });
    }
  }

  newTag(): void {
    if (!this.slashTag || this.slashTag === '/') {
      this.restartSearch();
    } else {
      // Remove trailing dash after user finished typing
      let value = this.slashTag;
      if (value[value.length - 1] === '-') {
        value = value.substr(0, value.length - 1);
      }
      this.slashTag = value;

      this.setSlashTag(this.slashTag);
    }
  }

  // from click on tag in search results
  setSlashTag(slashTag: string): void {
    // Get appDataService to broadcast (method shared by PointEditComponent)
    this.appData.SetSlashTag(slashTag);

    this.restartSearch();

    this.NewSlashTagSelected.emit(slashTag);
  }

  FontSize(Weight: number): string {
    // Restict Weight and font-size for smaller screens

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

  ngOnDestroy() {
    this.tagSearch$?.unsubscribe();
    this.tagResults$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
