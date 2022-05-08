// Angular
import { Component, OnInit, ViewChild } from '@angular/core';

// FreeVote
import { NavItemsComponent } from '../nav-items/nav-items.component';

@Component({
  selector: 'app-nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent implements OnInit {
  @ViewChild('navItems') navItems: NavItemsComponent | undefined;

  public setSelectedMenuItem(item: string) {
    this.navItems?.setSelectedMenuItem(item);
  }

  constructor() {}

  ngOnInit(): void {}
}
