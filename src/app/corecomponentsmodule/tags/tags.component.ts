import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../services/http-client.service';
import { Router } from '@angular/router';

import { CoreDataService } from '../../services/coredata.service';
import { TagsService, Tag } from '../../services/tags.service';

@Component({
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  providers: [] //Need HttpClientService as well as TagsService. NO: do not decorate components with service providers.
})

export class TagsComponent implements OnInit {

  tags: Tag[];

  constructor(private router: Router, private coreDataService: CoreDataService, private tagsService: TagsService) {

    if(this.router.url == '/trending'){
      this.coreDataService.SetPageTitle('trending');
    }
    else if (this.router.url == '/my/following-tags'){
      this.coreDataService.SetPageTitle('following');
    }

  }

  ngOnInit() {
    this.tagsService.Trending().subscribe(response => {
      this.tags = response;
    })
  }

  FontSize(Weight: number): string {
    var perCent = 100 + Weight * 50;
    return perCent + "%";
  }
}
