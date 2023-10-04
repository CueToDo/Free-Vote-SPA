// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Models, Enums
import { ID } from 'src/app/models/common';
import { PointTypesEnum, MyPointFilter } from 'src/app/models/enums';
import { PointsFilterFormData } from 'src/app/models/filterCriteria.model';
import {
  PointSelectionResult,
  Point,
  PointEdit,
  PointEditFormData
} from 'src/app/models/point.model';
import { PagePreviewMetaData } from 'src/app/models/pagePreviewMetaData.model';
import {
  PointFeedback,
  PointFeedbackFormData,
  PointWoWFormData
} from 'src/app/models/point.model';
import {
  PointSortTypes,
  PointSelectionTypes,
  PointSupportLevels,
  PointFlags,
  PointFeedbackFilter
} from 'src/app/models/enums';

// Services
import { HttpService } from './http.service';
import { AppDataService } from './app-data.service';

@Injectable({ providedIn: 'root' })
export class PointsService {
  // public PointsSelected = new Subject<any>();
  // public PointsSelectionError = new Subject<any>();

  public PointSelectionType = PointSelectionTypes.Point;

  private batchSize = 50;
  private pageSize = 10;

  // Pages retrieved from server
  pages: number[] = [];

  // Only get the WoWWeekInfo when voting for the first time - update after vote
  // Never trust the client to cache API values
  // public WoWWeekInfoVote: WoWWeekInfoVote;

  public Anon = false;

  constructor(
    private httpClientService: HttpService,
    private appData: AppDataService
  ) {
    // this.GetWoWWeekInfoVote();
  }

  GetFirstBatchQuestionPoints(
    constituencyID: number,
    slashTag: string,
    questionID: number,
    myPointFilter: MyPointFilter,
    unAttached: boolean,
    pointSortOrder: PointSortTypes,
    sortDescending: boolean
  ): Observable<PointSelectionResult> {
    const apiUrl =
      `points/getFirstBatchQuestionPoints/${constituencyID}/${slashTag.replace(
        '/',
        ''
      )}/${questionID}/${myPointFilter.toString()}` +
      `/${unAttached ? 'Y' : 'N'}/${pointSortOrder}/${sortDescending}/${
        this.batchSize
      }/${this.pageSize}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  // The standard selections for a Tag:
  // 1) First batch
  // 2) Subsequent batch (very similar to above, can these be consolidated?)
  // 3) Page of points for all selection methods
  GetFirstBatchForTag(
    constituencyIDFilter: number,
    constituencyIDVoter: number,
    slashTag: string,
    pointSortOrder: PointSortTypes,
    sortDescending: boolean,
    updateTopicCount: boolean
  ): Observable<PointSelectionResult> {
    // No Filters + infinite scroll on DateOrder desc

    const apiUrl =
      `points/getFirstBatchForTag/${constituencyIDFilter}/${constituencyIDVoter}/${slashTag.replace(
        '/',
        ''
      )}/${pointSortOrder}` +
      `/${sortDescending}/${this.batchSize}/${this.pageSize}/${updateTopicCount}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  // ToDo this is what needs to change for new selection methods
  GetFirstBatchFiltered(
    constituencyIDFilter: number,
    constituencyIDVoter: number,
    byAlias: string,
    onTopic: string,
    myPointsFilter: MyPointFilter,
    feedbackFilter: PointFeedbackFilter,
    pointFlag: PointFlags,
    pointTextFilter: string,
    pointTypeID: PointTypesEnum,
    from: Date,
    to: Date,
    pointSortOrder: PointSortTypes,
    sortDescending: boolean
  ): Observable<PointSelectionResult> {
    const fromDate = this.appData.UDF(from);
    const toDate = this.appData.UDF(to);

    // myPoints is not an optional flag added by the user
    const apiUrl = 'points/getFirstBatchFiltered';

    const postData = {
      constituencyIDFilter,
      constituencyIDVoter,
      byAlias,
      onTopic,
      myPointsFilter,
      feedbackFilter,
      pointFlag,
      pointTextFilter,
      pointTypeID,
      fromDate,
      toDate,
      pointSortOrder,
      sortDescending,
      batchSize: this.batchSize,
      pageSize: this.pageSize
    } as PointsFilterFormData;

    return this.httpClientService
      .post(apiUrl, postData)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  GetSpecificPoint(
    constituencyID: number,
    slashTag: string,
    pointTitle: string
  ): Observable<PointSelectionResult> {
    const apiUrl = `points/point/${constituencyID}/${slashTag}/${pointTitle}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  GetComment(
    constituencyID: number,
    pointID: number
  ): Observable<PointSelectionResult> {
    const apiUrl = `points/comment/${constituencyID}/${pointID}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  PorQPoints(
    constituencyID: number,
    porQID: number
  ): Observable<PointSelectionResult> {
    const apiUrl = `points/getFirstBatchForPorQ/${constituencyID}/${porQID}/${this.batchSize}/${this.pageSize}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  NewPointSelectionOrder(
    constituencyID: number,
    pointSortOrder: PointSortTypes,
    reversalOnly: boolean,
    knownTotalPointCount: number
  ): Observable<PointSelectionResult> {
    const apiUrl = `points/pointsSelectedReOrder/${constituencyID}/${pointSortOrder}/${
      reversalOnly ? 'Y' : 'N'
    }`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(
        map(returnData =>
          this.CastToPointSelectionResult(returnData, knownTotalPointCount)
        )
      );
  }

  GetNextBatch(
    constituencyIDVoter: number,
    pointSortOrder: PointSortTypes,
    fromRow: number,
    knowPointCountTotal: number
  ): Observable<PointSelectionResult> {
    const apiUrl = `points/getNextBatch/${constituencyIDVoter}/${pointSortOrder}/${fromRow}/${this.batchSize}/${this.pageSize}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(
        map(returnData =>
          this.CastToPointSelectionResult(returnData, knowPointCountTotal)
        )
      );
  }

  // returns a batch of points based on a list of IDs peviously returned to the client
  GetPage(
    constituencyIDVoter: number,
    pointIDs: ID[]
  ): Observable<PointSelectionResult> {
    if (!pointIDs || pointIDs.length === 0) {
      console.log('No points to select');
      return of(new PointSelectionResult());
    } else {
      const apiUrl = `points/getPage/${constituencyIDVoter}`;

      // ToDo Removed 03/01/2021 const ids not used???
      // https://stackoverflow.com/questions/16553561/passing-list-of-keyvaluepair-or-idictionary-to-web-api-controller-from-javascrip
      // construct an object from an array
      // const ids = {}; // a const where you can add new properties with values

      // pointIDs.forEach(item =>
      //   ids[item.rowNumber] = item.id);

      return this.httpClientService
        .post(apiUrl, pointIDs)
        .pipe(map(returnData => returnData as PointSelectionResult));
    }
  }

  CastToPointSelectionResult(
    sourceData: any,
    knownTotalCount: number
  ): PointSelectionResult {
    const PSR = new PointSelectionResult();

    if (knownTotalCount > 0) {
      PSR.pointCount = knownTotalCount;
    } else {
      PSR.pointCount = sourceData.pointCount;
    }
    PSR.fromDate = sourceData.fromDate;
    PSR.toDate = sourceData.toDate;

    // construct an Array of objects from an object
    if (PSR.pointCount > 0) {
      PSR.pointIDs = this.appData.CastObjectToIDs(sourceData.pointIDs);
      PSR.points = sourceData.points;
    }
    return PSR;
  }

  PointUpdate(
    point: PointEdit,
    isAnswer: boolean,
    isComment: boolean,
    isPorQPoint: boolean
  ): Observable<Point> {
    // Input parameter is Point not PointEdit
    // construct a new PointEdit (all that's needed)

    const postData = {
      ConstituencyID: point.constituencyID,
      PointID: point.pointID,
      QuestionID: point.questionID,
      PointTitle: point.pointTitle, // pointSlug constructed in API
      PointHTML: point.pointHTML,
      csvImageIDs: point.csvImageIDs,
      PointTypeID: point.pointTypeID,
      isAnswer,
      isComment,
      isPorQPoint, // not a point property
      ParentPointID: point.parentPointID,
      SoundCloudTrackID: point.soundCloudTrackID,
      SlashTags: point.tags
        .filter(tag => tag.pointOwnerTag)
        .map(tag => tag.slashTag),
      Draft: point.draft
    } as PointEditFormData;

    return this.httpClientService
      .post('points/pointUpdate', postData)
      .pipe(map(result => result as Point));
  }

  PointsSelectComments(
    parentPointID: number,
    constituencyIDVoter: number
  ): Observable<PointSelectionResult> {
    return this.httpClientService
      .get(`points/pointCommentsSelect/${parentPointID}/${constituencyIDVoter}`)
      .pipe(map(returnData => this.CastToPointSelectionResult(returnData, 0)));
  }

  PointCommentAncestors(
    replyPointID: number,
    constituencyIDVoter: number
  ): Observable<PointSelectionResult> {
    return this.httpClientService
      .get(
        `points/pointCommentAncestors/${replyPointID}/${constituencyIDVoter}`
      )
      .pipe(map(returnData => returnData as PointSelectionResult));
  }

  PointSourceMetaDataUpdate(
    pointID: number,
    link: string
  ): Observable<PagePreviewMetaData> {
    const postData = { ID: pointID, websiteUrl: link };

    return this.httpClientService
      .post('points/pointSourceMetaDataUpdate', postData)
      .pipe(map(result => result as PagePreviewMetaData));
  }

  PointDelete(pointID: number, constituencyID: number): Observable<boolean> {
    return this.httpClientService
      .get(`points/pointDelete/${pointID}/${constituencyID}`)
      .pipe(map(result => result as boolean));
  }

  PointFeedback(
    pointID: number,
    pointSupportLevel: PointSupportLevels,
    comment: string,
    feedbackAnon: boolean
  ): Observable<PointFeedback> {
    const postData: PointFeedbackFormData = {
      pointID,
      pointSupportLevel,
      comment,
      feedbackAnon
    };

    return this.httpClientService.post('points/PointFeedback', postData).pipe(
      tap(result => console.log('PointFeedback result:', result)),
      map(result => result as PointFeedback)
    );
  }

  PointFlag(
    deleteFlag: boolean,
    pointID: number,
    pointFlagType: PointFlags
  ): Observable<boolean> {
    let apiUrl = 'points/PointFlag';
    if (deleteFlag) {
      apiUrl += 'Delete';
    }

    apiUrl += `/${pointID}/${pointFlagType}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(result => result as boolean));
  }

  PointWoWVote(pointID: number, wow: boolean): Observable<PointFeedback> {
    // standard construction of post data
    const postData: PointWoWFormData = {
      // 'WeekID': this.WoWWeekInfoVote.WoWWeekID, 'WeekEndingDate': this.WoWWeekInfoVote.WoWWeekEndingDate,
      pointID,
      wow,
      feedbackAnon: this.Anon
    };

    console.log('PointWoWVote postData:', postData);

    // return PointFeedback as confirmed by API
    return this.httpClientService
      .post('points/PointWoWVote', postData)
      .pipe(map(result => result as PointFeedback));
    // this.WoWWeekInfoVote.WoWWeekID = pointFeedback.WoWWeekID; // always update regardless
    // this.WoWWeekInfoVote.WoWWeekEndingDate = pointFeedback.WoWWeekEndingDate; // always update regardless
  }
}
