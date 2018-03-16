import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { Observable } from 'rxjs/Rx';
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
debugger;
    return this.httpClientService
      .post(route, data)
      .then(response => response)    
  }


  SelectPoints(pointSelectionType: PointSelectionTypes, tag: string,
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
        route = "points/select/tag/" + tag;
        break;
    }

    //console.log('Selectpoints - ' + url);

    return this.httpClientService
      .post(route, data)
      .then(data => data as PointSelectionResult)


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
  PointText: string;
}

export class PointSelectionResult {
  PointsSelected: number;
  FromDate: string;
  ToDate: string;
  Points: Point[];
}
