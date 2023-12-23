// Angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs/internal/Subscription';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// FreeVote Services
import { AppDataService } from 'src/app/services/app-data.service';
import { Auth0Wrapper } from 'src/app/services/auth-wrapper.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-nav-items',
  templateUrl: './nav-items.component.html',
  styleUrls: ['./nav-items.component.css']
})
export class NavItemsComponent implements OnInit, OnDestroy {
  tagsPointsActive$: Subscription | undefined;

  get constituencyKebab(): string {
    return this.appData.kebabUri(this.localData.freeVoteProfile.constituency);
  }

  error = '';

  @Input() MenuType: string = 'main';

  constructor(
    public appData: AppDataService,
    public auth0Service: AuthService,
    public auth0Wrapper: Auth0Wrapper,
    public localData: LocalDataService
  ) {}

  ngOnInit(): void {
    // https://medium.com/@tomastrajan/how-to-get-route-path-parameters-in-non-routed-angular-components-32fc90d9cb52
    // menu.component is a non-routed component - it does not have it's own path
    // and never appears in router-outlet.
    // Use injected service to communicate between components

    // Following used to highlight slash tags menu item when clicking on tag in voter tag cloud
    this.tagsPointsActive$ = this.appData.TagsPointsActive$.subscribe(
      tagsPointsActive => {
        if (tagsPointsActive) {
          this.appData.MenuItemSelected = 'slashTags';
        }
      } // simply return boolean value to template
    );
  }

  logout() {
    this.localData.LocalLogging = false;
    this.auth0Wrapper.logout();
  }

  ngOnDestroy(): void {
    this.tagsPointsActive$?.unsubscribe();
  }
}
