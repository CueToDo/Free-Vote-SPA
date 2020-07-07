// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Auth0
import { AuthService } from 'src/app/services/auth.service';

// Other
import { DeviceDetectorService } from 'ngx-device-detector';

// FreeVote
import { LocalDataService } from './../../services/local-data.service';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  // @ViewChild('tvSlashTag', { static: false }) tvSlashTag: ElementRef;

  public slashTag: string;

  tabIndex = 0;

  survey = false;
  justice = false;
  ballot = false;

  anonimity = false;
  threats = false;
  threads = false;

  isMobile = null;

  privacyUrl = this.localData.siteUrl + 'policy.html';

  constructor(
    private router: Router,
    private deviceService: DeviceDetectorService,
    public localData: LocalDataService,
    public appData: AppDataService,
    public auth: AuthService) {

    this.epicFunction();

  }

  ngOnInit() {
    // Don't emit InputSlashTagOnMobile$ here as it triggers error in app.component
    // ExpressionChangedAfterItHasBeenCheckedError
  }

  epicFunction() {
    this.isMobile = this.deviceService.isMobile();
  }

  installPwa(): void {
    this.appData.promptEvent.prompt();
  }


  beginInput() {
    // Only update if we are on mobile
    if (this.isMobile) {
      this.appData.InputSlashTagOnMobile$.next(true);
    }
  }

  endInput() {
    // Only update if we are on mobile
    if (this.isMobile) {
      this.appData.InputSlashTagOnMobile$.next(false);
    }
  }

  restartSearch(): void {
    this.slashTag = '/';
  }

  // restartSearch(): void {
  //   this.slashTag = '/';
  //   window.setTimeout(() => {

  //     const el = this.tvSlashTag.nativeElement;

  //     // Don't satrt off with focus on input - mobile will never see Vulcan
  //     // el.focus();

  //     if (typeof el.selectionStart === 'number') {
  //       el.selectionStart = el.selectionEnd = el.value.length;
  //     } else if (typeof el.createTextRange !== 'undefined') {
  //       const range = el.createTextRange();
  //       range.collapse(false);
  //       range.select();
  //     }
  //   }, 500);

  // }


  slashTagChanged() {
    this.slashTag = this.appData.kebab(this.slashTag);
  }

  showTagPoints() {

    if (!this.slashTag || this.slashTag === '/') {
      // this.restartSearch();
    } else {
      // Remove trailing dash after user finished typing
      let value = this.slashTag;
      if (value[value.length - 1] === '-') { value = value.substr(0, value.length - 1); }
      this.slashTag = value;

      this.localData.PreviousSlashTagSelected = this.slashTag;

      this.router.navigateByUrl('/' + this.slashTag);
      this.slashTag = '';
    }
  }

}
