import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private router: Router) {

  }

  QuickPostURLs: string[] = ['/trending', '/selected','/my-selected', '/my-posts', '/favourite-posts', '/post-of-the-week', '/post-of-the-week-vote'];


  isActive(link): boolean {
    switch (link) {
      case "QuickPosts": {
        return this.QuickPostURLs.indexOf(this.router.url) > -1;
      }
      default: {
        return link == this.router.url;
      }
    }
  }

  ngOnInit() {
  }



}
