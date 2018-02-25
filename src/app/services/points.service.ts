import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PointsService {

  // public PointsSelected = new Subject<any>();
  // public PointsSelectionError = new Subject<any>();

  public PointSelectionType: PointSelectionTypes;

  //Pages retrieved from server
  pages: number[];

  constructor(private httpClientService: HttpClientService) {

  }

  SelectPoints(pointSelectionType: PointSelectionTypes, fromDate: string, toDate: string, containingText: string): Observable<PointSelectionResult> {

    let url = ""
    let data = { "FromDate": fromDate, "ToDate": toDate, "ContainingText": containingText };
    let success = false;

    switch (pointSelectionType) {
      case PointSelectionTypes.MyPoints:
        url = "points/select/my/";
        break;
      case PointSelectionTypes.Tag:
        url = "points/select/tag/";
        break;
    }

    debugger;

    console.log('Selectpoints');

    return this.httpClientService
      .post(url, data)
      .map(data => data as PointSelectionResult)


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

  MyPoints, // private/my-posts
  Favourites,
  Point,

  Group,
  Popular
}

export class Point {
  PointID: number;
  VoterIDPoint: number;
  PointText: string;
}

export class PointSelectionResult {
  PointsSelected: number;
  FromDate: string;
  ToDate: string;
  Points: Point[];
}
