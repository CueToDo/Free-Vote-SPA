import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Point } from '../../models/point.model';
import { Tag } from '../../models/tag.model';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css']
})
export class PointComponent implements OnInit {

  @Input() point: Point;

  tags: string[];  // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];

  constructor(private router: Router) { }

  ngOnInit() {
    // Angular Workshop filter is not a function

    // this.tags = this.tags.filter(x => x.SlashTag !== '/hash');

    // this.tags = this.point.Tags;

    // this.tags = this.point.Tags.filter((tag: Tag) => tag.SlashTag !== this.router.url);
    // this.tags = this.point.Tags.filter((tag, index, arr) => tag.SlashTag !== this.router.url);

    // function notThisRoute (element: Tag, index, array) { return element.SlashTag !== this.router.url; }
    // this.tags = this.point.Tags.filter(notThisRoute);

    // this.tags = this.point.Tags.filter(x => true);

    this.tags = this.point.SlashTags.filter(tag => tag !== this.router.url);

  }

}
