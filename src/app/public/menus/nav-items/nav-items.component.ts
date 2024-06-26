// Angular
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';

// rxjs
import { Subscription } from 'rxjs/internal/Subscription';

// FreeVote Services
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { BasicService } from 'src/app/services/basic.service';
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-nav-items',
  templateUrl: './nav-items.component.html',
  styleUrls: ['./nav-items.component.css'],
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    AsyncPipe
  ]
})
export class NavItemsComponent implements OnInit, OnDestroy {
  @Output() MenuItemsError = new EventEmitter<string>();
  @Output() ClearError = new EventEmitter();

  tagsPointsActive$: Subscription | undefined;
  signInError$: Subscription | undefined;
  photoUrl$: Subscription | undefined;

  get constituencyKebab(): string {
    return this.httpXS.kebabUri(this.localData.Constituency);
  }

  public MenuItemSelected = '';

  error = '';

  @Input() MenuType: string = 'main';

  get matTooltipPosition(): TooltipPosition {
    if (this.MenuType == 'main') return 'above';
    return 'right';
  }

  public photoUrl = '';

  constructor(
    public authService: AuthService,
    private basicService: BasicService,
    public appService: AppService,
    public localData: LocalDataService,
    private httpXS: HttpExtraService
  ) {}

  ngOnInit(): void {
    // https://medium.com/@tomastrajan/how-to-get-route-path-parameters-in-non-routed-angular-components-32fc90d9cb52
    // menu.component is a non-routed component - it does not have it's own path
    // and never appears in router-outlet.
    // Use injected service to communicate between components

    // Following used to highlight slash tags menu item when clicking on tag in voter tag cloud
    this.tagsPointsActive$ = this.appService.TagsPointsActive$.subscribe(
      tagsPointsActive => {
        if (tagsPointsActive) {
          this.MenuItemSelected = 'slashTags';
        }
      } // simply return boolean value to template
    );

    this.signInError$ = this.authService.SignInError$.subscribe(error =>
      this.MenuItemsError.emit(this.basicService.getError(error))
    );

    this.photoUrl$ = this.authService.PhotoUrl$.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
  }

  signInWithGoogle() {
    this.ClearError.emit();
    this.authService.signInWithGoogle();
  }

  signInWithX() {
    this.ClearError.emit();
    this.authService.signInWithX();
  }

  signInWithFacebook() {
    this.ClearError.emit();
    this.authService.signInWithFacebook();
  }

  signOut() {
    this.ClearError.emit();
    this.localData.LocalLogging = false;
    this.authService.signOut();
  }

  ngOnDestroy(): void {
    this.tagsPointsActive$?.unsubscribe();
    this.signInError$?.unsubscribe();
    this.photoUrl$?.unsubscribe();
  }
}
