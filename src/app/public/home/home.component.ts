// Angular
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

// FreeVote
import { AppService } from 'src/app/services/app.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // tslint:disable-next-line: deprecation
  public pwaPromptEvent: BeforeInstallPromptEvent | undefined;

  tabIndex = 0;

  survey = false;
  justice = false;
  ballot = false;

  anonimity = false;
  threats = false;
  threads = false;

  tabSelected = '';

  constructor(
    public appService: AppService,
    public localData: LocalDataService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // PWA installation - browser only
    if (isPlatformBrowser(this.platformId)) {
      // PWA https://love2dev.com/blog/beforeinstallprompt/
      window.addEventListener('beforeinstallprompt', event => {
        // tslint:disable-next-line: deprecation
        this.pwaPromptEvent = event as BeforeInstallPromptEvent;
      });
    }
  }

  ngOnInit(): void {
    // Don't emit InputSlashTagOnMobile$ here as it triggers error in app.component
    // ExpressionChangedAfterItHasBeenCheckedError

    this.tabIndex = 0;

    this.tabSelected = this.activatedRoute?.snapshot?.url[0]?.path;

    switch (this.tabSelected) {
      case 'about':
        this.tabIndex = 1;
        break;
      case 'privacy-policy':
        this.tabIndex = 2;
        break;
    }
  }

  installPwa(): void {
    this.pwaPromptEvent?.prompt();
  }
}
