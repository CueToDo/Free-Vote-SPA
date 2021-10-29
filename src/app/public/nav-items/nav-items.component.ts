import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs/internal/Subscription';

// FreeVote Models, Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-items',
  templateUrl: './nav-items.component.html',
  styleUrls: ['./nav-items.component.css']
})
export class NavItemsComponent implements OnInit, OnDestroy {
  TabSelected$: Subscription | undefined;
  tagsPointsActive$: Subscription | undefined;

  tabSelected = '';

  error = '';

  @Input() MenuType: string = 'main';

  constructor(
    public localData: LocalDataService,
    private appDataService: AppDataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // https://medium.com/@tomastrajan/how-to-get-route-path-parameters-in-non-routed-angular-components-32fc90d9cb52
    // menu.component is a non-routed component - it does not have it's own path
    // and never appears in router-outlet.
    // Use injected service to communicate between components

    // Following used to highlight slash tags menu item when clicking on tag in voter tag cloud
    this.tagsPointsActive$ = this.appDataService.TagsPointsActive$.subscribe(
      tagsPointsActive => {
        if (tagsPointsActive) {
          this.tabSelected = 'slashTags';
        }
      } // simply return boolean value to template
    );

    this.TabSelected$ = this.appDataService.TabSelected$.subscribe({
      next: pageName => (this.tabSelected = pageName)
    });

    this.localData.Log('NavComponent ngOnInit');
  }

  logout() {
    this.localData.LocalLogging = false;
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.TabSelected$?.unsubscribe();
    this.tagsPointsActive$?.unsubscribe();
  }
}
