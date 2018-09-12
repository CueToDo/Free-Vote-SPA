import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Point } from '../../models/point.model';
import { PointSupportLevels } from '../../models/enums';

// import { PointEditComponent } from '../point-edit/point-edit.component';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from '../../coreservices/points.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
  preserveWhitespaces: true
})
export class PointComponent implements OnInit {

  @Input() point: Point;

  tags: string[];  // = [<Tag>{ SlashTag: '/slash' }, <Tag>{ SlashTag: '/hash' }];

  signedIn = false;
  editing = false;
  error: string;

  constructor(private router: Router, private coreDataService: CoreDataService, private pointsService: PointsService) {
    this.coreDataService.SetPageTitle(this.router.url);
  }

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

    this.signedIn = this.coreDataService.SignedIn();
  }

  WoW() {
    this.point.WoWVote = !this.point.WoWVote;

    // Angular Workshop: Cannot read property 'name' of undefined
    // point.SupportLevelID was a number
    if (this.point.WoWVote) {
      this.Support();
    } else {
      this.PointFeedback();
    }
  }


  Support() {
    this.point.SupportLevelID = PointSupportLevels.Support;
    this.PointFeedback();
  }

  Neutral() {
    this.point.SupportLevelID = PointSupportLevels.StandAside;
    this.point.WoWVote = false;
    this.PointFeedback();
  }

  Oppose() {
    this.point.SupportLevelID = PointSupportLevels.Oppose;
    this.point.WoWVote = false;
    this.PointFeedback();
  }

  Report() {
    this.point.SupportLevelID = PointSupportLevels.Report;
    this.point.WoWVote = false;
    this.PointFeedback();
  }

  PointFeedback() {

    this.pointsService.PointFeedback(this.point.PointID, this.point.SupportLevelID, '', false)
      .then(response => {
        this.point.FeedbackDate = response;
      })
      .catch(serverError => this.error = serverError.error.error);
  }

  edit() { this.editing = true; }

  delete() {
    if (confirm('Are you sure you wish to delete this point?')) {
      alert('Go delete');
    }
  }

  favourite() { alert('favourite'); }

  addRemoveTags() { alert('add remove tags'); }

  onCancel() { this.editing = false; }

}
