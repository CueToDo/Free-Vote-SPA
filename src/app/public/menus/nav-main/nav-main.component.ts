// Angular
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

// Components
import { NavItemsComponent } from '../nav-items/nav-items.component';

@Component({
  selector: 'app-nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css'],
  standalone: true,
  imports: [NavItemsComponent]
})
export class NavMainComponent implements OnInit {
  @Output() MainMenuError = new EventEmitter<string>();
  @Output() MainMenuErrorClear = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  MenuItemsError(error: string) {
    this.MainMenuError.emit(error);
  }

  ClearError() {
    this.MainMenuErrorClear.emit();
  }
}
