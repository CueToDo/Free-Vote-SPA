// Angular
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Models, Enums
import { Tabs } from 'src/app/models/enums';

@Component({
  selector: 'app-points-and-questions-menu',
  templateUrl: './points-and-questions-menu.component.html',
  styleUrls: ['./points-and-questions-menu.component.css']
})
export class PointsAndQuestionsMenuComponent {
  @Input() tabIndex = Tabs.trendingTags;
  @Input() qp = '';

  @Output() ShowQuestions = new EventEmitter();
  @Output() ChangeTab = new EventEmitter<Tabs>();

  public Tabs = Tabs;

  get pointsOrQuestionsIcon(): string {
    if (this.qp === 'question') return 'help';
    return 'comment';
  }

  constructor(public auth0Service: AuthService) {}

  showQuestions() {
    this.ShowQuestions.emit();
  }

  changeTab(tab: Tabs) {
    this.ChangeTab.emit(tab);
  }
}
