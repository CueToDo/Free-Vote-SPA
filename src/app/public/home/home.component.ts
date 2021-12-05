// Angular
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

// Auth0
import { AuthService } from 'src/app/services/auth.service';

// FreeVote
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tabIndex = 0;

  survey = false;
  justice = false;
  ballot = false;

  anonimity = false;
  threats = false;
  threads = false;

  tabSelected = '';

  constructor(
    public appData: AppDataService,
    public localData: LocalDataService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService
  ) {}

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
    this.appData?.promptEvent?.prompt();
  }
}
