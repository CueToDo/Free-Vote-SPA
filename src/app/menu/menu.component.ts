import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor() { }

  activeLink = "Home";

  isHome = true;

  active(link) {
    this.activeLink = link;
  }

  isActive(link): boolean {
    return link == this.activeLink;
  }

  ngOnInit() {
  }



}
