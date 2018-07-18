import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';

import { PointSelectionTypes } from '../models/enums';
import { PointSelectionResult } from '../models/point.model';

@Injectable()
export class PointsService {

  // public PointsSelected = new Subject<any>();
  // public PointsSelectionError = new Subject<any>();

  public PointSelectionType: PointSelectionTypes;

  // Pages retrieved from server
  pages: number[];

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

  PointUpdate(pointID: number, point: string, draft: boolean): Promise<boolean> {

    const postData = { 'PointID': pointID, 'Point': point, 'Draft': draft };

    return this.httpClientService
      .post('points/pointupdate', postData)
      .then(result => {
        return result as boolean;
      });
  }

}
