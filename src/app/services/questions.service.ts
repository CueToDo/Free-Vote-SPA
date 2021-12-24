// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/internal/Observable';
import { map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// Models, enums
import { PointSortTypes, PointSupportLevels } from '../models/enums';
import {
  QuestionSelectionResult,
  QuestionEdit
} from '../models/question.model';
import { ID } from '../models/common';

// Services
import { HttpService } from './http.service';
import { AppDataService } from './app-data.service';
import { Kvp } from '../models/kvp.model';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private batchSize = 50;
  private pageSize = 10;

  constructor(
    private httpClientService: HttpService,
    private appDataService: AppDataService
  ) {
    // this.GetWoWWeekInfoVote();
  }

  GetFirstBatchForTag(
    slashTag: string,
    pointSortOrder: PointSortTypes,
    sortAscending: boolean,
    updateTopicViewCount: boolean
  ): Observable<QuestionSelectionResult> {
    // No Filters + infinite scroll on DateOrder desc
    const apiUrl =
      `questions/getFirstBatchForTag/${slashTag.replace(
        '/',
        ''
      )}/${pointSortOrder}` +
      `/${sortAscending}/${this.batchSize}/${this.pageSize}/${updateTopicViewCount}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToQuestionSelectionResult(returnData)));
  }

  CastToQuestionSelectionResult(sourceData: any): QuestionSelectionResult {
    const QSR = new QuestionSelectionResult();

    QSR.questionCount = sourceData.questionCount;

    // construct an Array of objects from an object
    QSR.questionIDs = this.appDataService.CastObjectToIDs(
      sourceData.questionIDs
    );
    QSR.questions = sourceData.questions;
    QSR.tagID = sourceData.tagID;

    return QSR;
  }

  GetNextBatch(
    pointSortOrder: PointSortTypes,
    fromRow: number
  ): Observable<QuestionSelectionResult> {
    const apiUrl = `questions/getNextBatch/${pointSortOrder}/${fromRow}/${this.batchSize}/${this.pageSize}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToQuestionSelectionResult(returnData)));
  }

  // returns a batch of points based on a list of IDs peviously returned to the client
  GetPage(questionIDs: ID[]): Observable<QuestionSelectionResult> {
    if (!questionIDs || questionIDs.length === 0) {
      console.log('No questions to select');
      return of(new QuestionSelectionResult());
    } else {
      const apiUrl = 'points/getPage';

      return this.httpClientService
        .post(apiUrl, questionIDs)
        .pipe(map(returnData => returnData as QuestionSelectionResult));
    }
  }

  NewQuestionSelectionOrder(
    sortOrder: PointSortTypes,
    reversalOnly: boolean
  ): Observable<QuestionSelectionResult> {
    const apiUrl = `questions/questionsSelectedReOrder/${sortOrder}/${
      reversalOnly ? 'Y' : 'N'
    }`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToQuestionSelectionResult(returnData)));
  }

  QuestionUpdate(questionEdit: QuestionEdit): Observable<Kvp> {
    const apiUrl = 'questions/questionUpdate';

    const postData = {
      questionID: questionEdit.questionID,
      question: questionEdit.question,
      details: questionEdit.details,
      draft: questionEdit.draft,
      slashTags: questionEdit.slashTags
    } as QuestionEdit;

    return this.httpClientService.post(apiUrl, postData);
  }

  QuestionDelete(questionID: number): Observable<boolean> {
    return this.httpClientService
      .get(`questions/questionDelete/${questionID}`)
      .pipe(map(result => result as boolean));
  }

  QuestionVote(
    questionID: number,
    supportLevelID: PointSupportLevels,
    voteAnon: boolean
  ): Observable<string> {
    return this.httpClientService
      .get(
        `questions/questionFeedbackUpdate/${questionID}/${supportLevelID}/${voteAnon}`
      )
      .pipe(map(result => result.value)); // JSON Object : handling
  }

  QuestionPointAddRemove(
    tag: string,
    add: boolean,
    questionSlug: string,
    pointID: number
  ): Observable<boolean> {
    return this.httpClientService.get(
      `questions/${tag}/questionPoint/${
        add ? 'add' : 'remove'
      }/${questionSlug}/${pointID}`
    );
  }
}
