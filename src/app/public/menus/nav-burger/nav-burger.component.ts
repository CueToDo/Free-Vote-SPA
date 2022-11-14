import { Component } from '@angular/core';

// Animations
import { burgerMenuTrigger } from 'src/app/public/animations';

@Component({
  selector: 'app-nav-burger',
  templateUrl: './nav-burger.component.html',
  styleUrls: ['./nav-burger.component.css'],
  animations: [burgerMenuTrigger]
})
export class NavBurgerComponent {
  burgerMenuState = 'hide';

  constructor() {}

  public ShowMenu(show: boolean) {
    if (show) this.burgerMenuState = 'show';
    else this.burgerMenuState = 'hide';
  }
}
