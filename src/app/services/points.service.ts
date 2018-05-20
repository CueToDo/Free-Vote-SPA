import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class PointsService {

  // public PointsSelected = new Subject<any>();
  // public PointsSelectionError = new Subject<any>();

  public PointSelectionType: PointSelectionTypes;

  //Pages retrieved from server
  pages: number[];

  constructor(private httpClientService: HttpClientService, private route: ActivatedRoute) {

  }

  PointsTaggedMinDate(tagRoute: string, points: number): Promise<string> {

    let data = { "TagRoute": tagRoute, "Points": points };
    let route = "points/taggedMinDate";

    return this.httpClientService
      .post(route, data)
      .then(response => response)
  }


  SelectPoints(pointSelectionType: PointSelectionTypes, slashTag: string,
    fromDate: string, toDate: string, containingText: string): Promise<PointSelectionResult> {

    let route = ""
    let data = { "FromDate": fromDate, "ToDate": toDate, "ContainingText": containingText };
    let success = false;

    switch (pointSelectionType) {
      case PointSelectionTypes.MyPoints:
        route = "points/select/my/points";
        break;
      case PointSelectionTypes.FavouritePoints:
        route = "points/select/my/favourite-points";
        break;
      case PointSelectionTypes.Tag: ;
        route = "points/select/tag/" + slashTag; //minus slash!
        break;
    }

    console.log('Selectpoints - ' + route);

    return this.httpClientService
      .post(route, data)
      .then(data => {
        console.log(data);
        return data as PointSelectionResult;
      })
  

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




}

export enum PointSelectionTypes {
  //Not used in database
  Tag,
  TagSurvey,
  CDMPProposal,

  POTW,
  POTWVote,
  WoWAdmin,

  MyPoints,
  FavouritePoints,
  Point,

  Group,
  Popular
}

export class Point {
  PointID: number;
  VoterIDPoint: number;

  PointTypeID:number;
  PointTypeIDVoter:number;

  PointText: string;

  Draft : boolean;
  Source: string;
  URL: string;
  Archived: boolean;
  DateTimeUpdated: string;

  Sequence:number;
  LastRowNumber:number;
  LastRow: boolean;

  FeedbackGiven: boolean;
  FeedbackID:number;
  SupportLevelID:number;
  Comment: string;
  FeedbackDate: string;
  FeedbackIsUpdatable: boolean;
  WoWVote: boolean;

  Attached: boolean;

  Adoptable: boolean;
  Unadoptable: boolean;

  TotalFeedback:number;
  NetSupport:number;
  PerCentInFavour:number;

  Support:number;
  Opposition:number;
  Abstentions:number;
  Reports:number;

  IsInOpenedSurvey: boolean;
  IsInClosedSurvey: boolean;
  IsQuestionAnswer: boolean;
}

export class PointSelectionResult {
  PointsSelected: number;
  FromDate: string;
  ToDate: string;
  Points: Point[];
}
