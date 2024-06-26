// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';

// rxJs
import { Subscription } from 'rxjs';

// Model
import { ByOn } from '../../models/ByOn.model';

// Services
import { AppService } from '../../services/app.service';
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { TagsService } from '../../services/tags.service';
import { TagDisplayPipe } from '../../custommodule/pipes/tag-display.pipe';
import { NgIf, NgFor, NgStyle } from '@angular/common';

@Component({
    selector: 'app-by',
    templateUrl: './by.component.html',
    styleUrls: ['./by.component.css'],
    preserveWhitespaces: true,
    standalone: true,
    imports: [NgIf, NgFor, NgStyle, RouterLink, TagDisplayPipe]
})
export class ByComponent implements OnInit, OnDestroy {
  // Subscriptions
  private aliases$: Subscription | undefined;

  byAliases: ByOn[] = [];
  onTopics: ByOn[] = [];
  byAlias = '';

  // https://stackoverflow.com/questions/37891752/angular2-add-class-to-item-on-click/37891984
  highlightStatus: Array<boolean> = [];

  waitingVoters = true;
  waitingTopics = false;

  error = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private localData: LocalDataService,
    public appService: AppService,
    private tagsService: TagsService,
    public httpXS: HttpExtraService
  ) {}

  ngOnInit(): void {
    // Get Aliases
    this.aliases$ = this.tagsService
      .ByAliases('1 jan 2000', '31 dec 2050')
      .subscribe({
        next: response => {
          this.byAliases = response;
          this.waitingVoters = false;
        },
        error: serverError => {
          this.error = serverError.error.detail;
          this.waitingVoters = false;
        }
      });

    // The ActivatedRoute dies with the routed component and so
    // the subscription dies with it.
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const alias = params.get('alias');
      if (alias) {
        this.ListTopicsByAlias(alias);
      }
    });
  }

  FontSize(Weight: number): string {
    return 100 + Weight * 50 + '%'; // perCent
  }

  highlight(byAlias: string): void {
    for (let i = 0; i < this.byAliases.length; i++) {
      this.highlightStatus[i] = this.byAliases[i].byOn === byAlias;
    }
  }

  ListTopicsByAlias(byAlias: string): void {
    if (byAlias) {
      this.highlight(byAlias);

      this.byAlias = byAlias;

      // Save to Current and to Previous value - used after setting Current to empty string in Tags Component
      this.localData.ActiveAliasForFilter = byAlias;
      this.localData.PreviousAliasSelected = byAlias;

      // Communicate the change to app component
      this.appService.RouteParamChange$.next(`/by/${byAlias}`);

      this.waitingTopics = true;

      this.tagsService
        .TopicsByAlias(byAlias, '1 Jan 2000', '31 Dec 2030')
        .subscribe({
          next: response => {
            this.onTopics = response;
            this.waitingTopics = false;
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  ngOnDestroy(): void {
    this.aliases$?.unsubscribe();
  }
}
