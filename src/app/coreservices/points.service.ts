import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { ActivatedRoute } from '@angular/router';

import { PointSelectionTypes } from '../models/enums';
import { PointSupportLevels } from '../models/enums';
import { PointSelectionResult, PointEdit, WoWWeekInfoVote } from '../models/point.model';

@Injectable()
export class PointsService {

  // public PointsSelected = new Subject<any>();
  // public PointsSelectionError = new Subject<any>();

  public PointSelectionType: PointSelectionTypes;

  // Pages retrieved from server
  pages: number[];

  // Only get the WoWWeekInfo when voting for the first time - update after vote
  public WoWWeekInfoVote: WoWWeekInfoVote;
  public Anon: boolean;

  constructor(private httpClientService: HttpClientService, private route: ActivatedRoute) {

  }

  PointsTaggedMinDate(tagRoute: string, points: number): Promise<string> {

    const postData = { 'TagRoute': tagRoute, 'Points': points };
    const apiRoute = 'points/taggedMinDate';

    return this.httpClientService
      .post(apiRoute, postData)
      .then(response => response);
  }


  SelectPoints(pointSelectionType: PointSelectionTypes, slashTag: string,
    fromDate: string, toDate: string, containingText: string): Promise<PointSelectionResult> {

    let route = '';
    const postData = { 'FromDate': fromDate, 'ToDate': toDate, 'ContainingText': containingText };
    // let success = false;

    switch (pointSelectionType) {
      case PointSelectionTypes.MyPoints:
        route = 'points/select/my/points';
        break;
      case PointSelectionTypes.FavouritePoints:
        route = 'points/select/my/favourite-points';
        break;
      case PointSelectionTypes.Tag:
        route = 'points/select/tag/' + slashTag; // minus slash!
        break;
    }

    console.log('Selectpoints - ' + route);

    return this.httpClientService
      .post(route, postData)
      .then(returnData => {
        console.log(returnData);
        return returnData as PointSelectionResult;
      });


    // .subscribe(response => {

    //   //Notify observers
    //   this.PointsSelectionError.next(null); //Clear any error
    //   this.PointsSelected.next();
    // },
    //   error => {
    //     console.log('httpClientService ERROR: ' + error.error.error);
    //     this.PointsSelectionError.next(error.error.error);
    //   });
  }

  PointUpdate(point: PointEdit): Promise<number> {

    console.log('PointUpdate: ', point);

    const postData = {
      'PointID': point.PointID, 'PointHTML': point.PointHTML,
      'SlashTags': point.SlashTags, 'Draft': point.Draft
    };

    return this.httpClientService
      .post('points/pointupdate', postData)
      .then(result => result as number);
  }

  PointFeedback(pointID: number, pointSupportLevel: PointSupportLevels, comment: string, feedbackAnon: boolean): Promise<string> {

    const postData = { 'PointID': pointID, 'PointSupportLevel': pointSupportLevel, 'Comment': comment, 'FeedbackAnon': feedbackAnon };

    return this.httpClientService
      .post('points/PointFeedback', postData)
      .then(result => result);
  }


  // WoWWeekInfo for Vote is the current voting WeekID and Date
  // Simply return saved value, or fetch from service
  GetWoWWeekInfoVote(): Promise<WoWWeekInfoVote> {
    if (this.WoWWeekInfoVote) {
      console.log('WoWWeekInfoVoteClient:', this.WoWWeekInfoVote);
      return Promise.resolve(this.WoWWeekInfoVote);
    } else {
      return this.httpClientService
        .get('points/WoWWeekInfoVote')
        .then(result => {
          this.WoWWeekInfoVote = result as WoWWeekInfoVote;
          console.log('WoWWeekInfoVoteService:', this.WoWWeekInfoVote);
          return this.WoWWeekInfoVote;
        });
    }
  }

//
  PointWoWVote(pointID: number, wow: boolean): Promise<string> {

    // Get WoW Voting Week Info to submit. Updated after vote.
    return this.GetWoWWeekInfoVote().then(
      wwiv => {
        // standard construction of post data
        const postData = {
          'WeekID': wwiv.WeekID, 'WeekEndingDate': wwiv.WeekEndingDate, 'PointID': pointID, 'WoW': wow, 'Anon': this.Anon
        };

        // return datetime of vote as promise<string>
        return this.httpClientService
          .post('points/PointWoWVote', postData)
          .then(result => {
            this.WoWWeekInfoVote = result as WoWWeekInfoVote; // always update regardless
            return this.WoWWeekInfoVote.PointWoWDateTime;
          });

      });
  }


}
