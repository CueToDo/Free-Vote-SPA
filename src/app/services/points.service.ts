import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PointsService {

  public PointsSelected = new Subject<any>();
  public PointsSelectionError = new Subject<any>();

  public PointSelectionType: PointSelectionTypes;

  //Pages retrieved from server
  pages: number[];

  constructor(private httpClientService: HttpClientService) {

  }

  SelectPoints(pointSelectionType: PointSelectionTypes, dateFrom: string, dateTo: string, containingText: string) {

    debugger;

    let url=""
    let data = { "DateFrom": dateFrom, "DateTo": dateTo, "ContainingText": containingText };
    let success = false;

    switch (pointSelectionType) {
      case PointSelectionTypes.MyPoints:
        url = "points/mypoints/";
        break;
    }

    debugger;

    console.log('Selectpoints');

    this.httpClientService

      .post(url, data)

      //.map(response => response.json()); //assumed - not needed

      .subscribe(response => {

        //Notify observers 
        this.PointsSelectionError.next(null); //Clear any error
        this.PointsSelected.next();
      },
      error => {
        console.log('httpClientService ERROR: ' + error.error.error);
        this.PointsSelectionError.next(error.error.error);
      });
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
