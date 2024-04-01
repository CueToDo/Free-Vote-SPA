import { Component } from '@angular/core';

// Animations
import { burgerMenuTrigger } from 'src/app/public/animations';
import { NavItemsComponent } from '../nav-items/nav-items.component';

@Component({
    selector: 'app-nav-burger',
    templateUrl: './nav-burger.component.html',
    styleUrls: ['./nav-burger.component.css'],
    animations: [burgerMenuTrigger],
    standalone: true,
    imports: [NavItemsComponent]
})
export class NavBurgerComponent {
  burgerMenuState = 'hide';

  constructor() {}

  public ShowMenu(show: boolean) {
    if (show) this.burgerMenuState = 'show';
    else this.burgerMenuState = 'hide';
  }
}
