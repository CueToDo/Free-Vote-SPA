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
  Output,
  Input
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

// rxjs
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Models
import { Tag } from 'src/app/models/tag.model';

// FreeVote Services
import { AppService } from 'src/app/services/app.service';
import { LocalDataService } from '../../services/local-data.service';
import { TagsService } from 'src/app/services/tags.service';

// Other
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-tag-search',
  templateUrl: './tag-search.component.html',
  styleUrls: ['./tag-search.component.css']
})
export class TagSearchComponent implements OnInit, AfterViewInit {
  @Input() ForConstituency = false;

  @Output() CreateNewSlashTag = new EventEmitter<string>();
  @Output() Tags = new EventEmitter<Tag[]>();
  @Output() Cancel = new EventEmitter();

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  @ViewChild('tvSlashTag', { static: false }) tvSlashTag:
    | ElementRef
    | undefined;

  slashTag = '';
  tagSearch$: Subscription | undefined;
  tagResults$: Subscription | undefined;
  searching = false;
  haveSearched = false;
  haveTags = false;

  isMobile = false;
  error = '';

  // Viewport width monitoring
  width$?: Subscription;
  widthBand = 4;

  constructor(
    private ngZone: NgZone,
    public appService: AppService,
    public localData: LocalDataService,
    private tagsService: TagsService,
    private deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.epicFunction();

    // appComponent monitors width and broadcasts via appServiceService
    this.width$ = this.appService.DisplayWidth$.subscribe(
      (widthBand: number) => {
        this.widthBand = widthBand;
      }
    );
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
            this.ngZone.run(() => {
              this.tagSearch();
            });
          }
        });
    });
  }

  epicFunction(): void {
    this.isMobile = this.deviceService.isMobile();
  }

  public clearSearchText(): void {
    // Client side only
    if (isPlatformBrowser(this.platformId)) {
      this.slashTag = '/';
      this.Tags.emit([]);
      this.searching = false;

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

  continueSearch() {
    setTimeout(() => {
      // Set focus on input
      if (!this.slashTag) {
        this.slashTag = '/';
      }
      this.tvSlashTag?.nativeElement?.focus();
    });
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

  SetConstituencyID(search: boolean) {
    if (search) {
      this.tagSearch();
    }
  }

  // Go to API to get matching tags after debouncing keyups
  tagSearch() {
    //min '/' plus 2 characters to search api
    if (this.slashTag.length > 2) {
      this.searching = true;
      this.haveSearched = true;

      this.tagResults$ = this.tagsService
        .TagSearch(this.slashTag, this.localData.ConstituencyID)
        .subscribe({
          next: slashTags => {
            this.haveTags = slashTags?.length > 0;
            this.Tags.emit(slashTags);
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
      this.clearSearchText();
    } else {
      // Remove trailing dash after user finished typing
      let value = this.slashTag;
      if (value[value.length - 1] === '-') {
        value = value.substr(0, value.length - 1);
      }
      this.slashTag = value;

      // Get appServiceService to broadcast (method shared by PointEditComponent)
      this.tagsService.SetSlashTag(this.slashTag);

      this.CreateNewSlashTag.emit(this.slashTag);
    }
  }

  cancel(): void {
    this.Cancel.emit();
  }

  ngOnDestroy() {
    this.tagSearch$?.unsubscribe();
    this.tagResults$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
