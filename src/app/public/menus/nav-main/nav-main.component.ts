// Angular
import { Component, OnInit } from '@angular/core';
import { NavItemsComponent } from '../nav-items/nav-items.component';

// FreeVote

@Component({
    selector: 'app-nav-main',
    templateUrl: './nav-main.component.html',
    styleUrls: ['./nav-main.component.css'],
    standalone: true,
    imports: [NavItemsComponent]
})
export class NavMainComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
