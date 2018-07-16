import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../coreservices/http-client.service';
import { Router } from '@angular/router';

import { CoreDataService } from '../../coreservices/coredata.service';
import { TagsService, Tag } from '../../coreservices/tags.service';
import { TagDisplayPipe } from '../tag-display.pipe';

@Component({
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  providers: [], //  Need HttpClientService as well as TagsService. NO: do not decorate components with service providers.
  preserveWhitespaces: true
})

export class TagsComponent implements OnInit {

  tags: Tag[];

  constructor(private router: Router, private coreDataService: CoreDataService, private tagsService: TagsService) {

    if (this.router.url === '/trending') {
      this.coreDataService.SetPageTitle('trending');
    } else if (this.router.url === '/my/following-tags') {
      this.coreDataService.SetPageTitle('following');
    }

  }

  ngOnInit() {
    this.tagsService.Trending().then(response => {
      this.tags = response;
    });
  }

  FontSize(Weight: number): string {
    return 100 + Weight * 50 + '%'; // perCent
  }
}
