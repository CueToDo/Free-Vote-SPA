import { LocalDataService } from '../../../services/local-data.service';
// Angular
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Models, Enums
import { Tabs } from 'src/app/models/enums';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.css']
})
export class SelectMenuComponent {
  @Input() tabIndex = Tabs.trendingTags;

  @Output() ChangeTab = new EventEmitter<Tabs>();

  // Template enum
  public Tabs = Tabs;

  // 1,2 Questions or points
  @Input() qp = '';

  // 3. Search filter criteria
  @Input() showFilters = false;
  @Output() showFiltersChange = new EventEmitter<boolean>();

  public get filterText(): string {
    if (this.showFilters) return 'searching';
    return 'search';
  }

  public get filterToolTip(): string {
    if (this.showFilters) return 'hide search criteria';
    return 'show point search criteria';
  }

  public get filterIcon(): string {
    if (this.showFilters) return 'manage_search';
    return 'search';
  }

  // 4. Feedback
  @Output() feedbackChange = new EventEmitter<boolean>();

  feedbackOn = true;

  get feedbackIcon(): string {
    if (this.feedbackOn) return 'speaker_notes_off';
    return 'view_list';
  }
  get feedbackText(): string {
    if (this.feedbackOn) return 'turn feedback OFF';
    return 'turn feedback ON';
  }

  // 5. Refresh
  @Output() refresh = new EventEmitter();

  constructor(
    public auth0Service: AuthService,
    public localData: LocalDataService
  ) {}

  // 1. Questions
  showQuestions(): void {
    this.qp = 'question';
    this.ChangeTab.emit(Tabs.questionList);
  }

  // 2. Points
  showPoints(): void {
    this.qp = 'point';
    this.ChangeTab.emit(Tabs.tagPoints);
  }

  // 3. Search Filters
  toggleShowPointFilterCriteria(): void {
    this.showFilters = !this.showFilters;
    this.showFiltersChange.emit(this.showFilters);
  }

  // 4. Feedback switch
  toggleFeedback() {
    this.feedbackOn = !this.feedbackOn;
    this.feedbackChange.emit(this.feedbackOn);
  }

  // 5. Refresh
  refreshSelection() {
    this.refresh.emit();
  }
}
