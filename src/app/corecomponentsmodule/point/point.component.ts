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

  PointFeedback(pointSupportLevel: PointSupportLevels): Promise<boolean> {

    return new Promise((resolve, reject) => {

      if (!this.point.FeedbackIsUpdatable) {

        alert('Feedback is not updatable');
        return reject(false);
      } else {

        if (this.point.SupportLevelID === pointSupportLevel) {
          // If clicked on the current support level then delete it
          if (confirm('Are you sure you wish to delete your feedback?')) {
            pointSupportLevel = PointSupportLevels.None;
          } else { return reject(false); } // Cancel feedback delete
        }

        this.pointsService.PointFeedback(this.point.PointID, pointSupportLevel, '', false)
          .then(response => {
            this.point.FeedbackDate = response;
            this.point.SupportLevelID = pointSupportLevel;
            console.log('ERE PointSupportlevel: ', this.point.SupportLevelID);
            return resolve(true); // Angular workshop - NOT Promise.resolve
          })
          .catch(serverError => {
            console.log('PointFeedback Error');
            this.error = serverError.error.error;
            return reject(false);
          });
      }
    });
  }

  WoW() {

    console.log('BEGIN WoW');

    // ToDo Angular Workshop: Cannot read property 'name' of undefined
    // point.SupportLevelID was a number. Loosely typed
    if (!this.point.WoWVote && this.point.SupportLevelID !== PointSupportLevels.Support) {
      console.log('10-6: ', this.point.SupportLevelID);
      this.PointFeedback(PointSupportLevels.Support).then(
        success => {
          console.log(success, 'Success PointSupportlevel: ', this.point.SupportLevelID);
          this.WoW();
        },
        fail => console.log('fail: ', fail) );
    } else {
      // Update WoW
      console.log('CAN now WoW');
      this.pointsService.PointWoWVote(this.point.PointID, !this.point.WoWVote)
        .then(
          wowDate => {
            this.point.WoWVote = !this.point.WoWVote; // Toggle the WoW vote
            this.point.FeedbackDate = wowDate; // Display the updated vote time
          });
    }
  }

  Support() {
    this.PointFeedback(PointSupportLevels.Support);
  }

  Neutral() {
    this.point.WoWVote = false;
    this.PointFeedback(PointSupportLevels.StandAside);
  }

  Oppose() {
    this.point.WoWVote = false;
    this.PointFeedback(PointSupportLevels.Oppose);
  }

  Report() {
    this.point.WoWVote = false;
    this.PointFeedback(PointSupportLevels.Report);
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
