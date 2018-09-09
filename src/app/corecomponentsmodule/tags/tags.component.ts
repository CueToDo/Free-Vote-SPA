import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CoreDataService } from '../../coreservices/coredata.service';
import { TagsService } from '../../coreservices/tags.service';

import { Tag } from '../../models/tag.model';

@Component({
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  providers: [], //  Need HttpClientService as well as TagsService. NO: do not decorate components with service providers.
  preserveWhitespaces: true
})
export class TagsComponent implements OnInit {

  tags: Tag[];

  constructor(private router: Router, private coreDataService: CoreDataService, private tagsService: TagsService) {
    this.coreDataService.SetPageTitle(router.url);
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
