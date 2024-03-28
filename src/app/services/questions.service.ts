// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

// Models, enums
import { ID } from '../models/common';
import { Kvp } from '../models/kvp.model';
import { PointSortTypes, PointSupportLevels } from '../models/enums';
import {
  QuestionSelectionResult,
  QuestionEdit,
  QuestionEditFormData
} from '../models/question.model';

// Services
import { BasicService } from './basic.service';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private batchSize = 50;
  private pageSize = 10;

  constructor(
    private basicService: BasicService,
    private httpClientService: HttpService
  ) {
    // this.GetWoWWeekInfoVote();
  }

  GetFirstBatchForTag(
    constituencyIDFilter: number,
    slashTag: string,
    pointSortOrder: PointSortTypes,
    sortDescending: boolean,
    updateTopicViewCount: boolean
  ): Observable<QuestionSelectionResult> {
    // No Filters + infinite scroll on DateOrder desc
    const apiUrl =
      `questions/getFirstBatchForTag/${constituencyIDFilter}/${slashTag.replace(
        '/',
        ''
      )}/${pointSortOrder}` +
      `/${sortDescending}/${this.batchSize}/${this.pageSize}/${updateTopicViewCount}`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToQuestionSelectionResult(returnData)));
  }

  CastToQuestionSelectionResult(sourceData: any): QuestionSelectionResult {
    const QSR = new QuestionSelectionResult();

    QSR.questionCount = sourceData.questionCount;

    // construct an Array of objects from an object
    QSR.questionIDs = this.basicService.CastObjectToIDs(sourceData.questionIDs);
    QSR.questions = sourceData.questions;
    QSR.tagID = sourceData.tagID;

    return QSR;
  }

  GetNextBatch(
    constituencyIDVoter: number,
    pointSortOrder: PointSortTypes,
    fromRow: number
  ): Observable<QuestionSelectionResult> {
    const apiUrl = `questions/getNextBatch/${constituencyIDVoter}/${pointSortOrder}/${fromRow}/${this.batchSize}/${this.pageSize}`;

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
    constituencyIDVoter: number,
    sortOrder: PointSortTypes,
    reversalOnly: boolean
  ): Observable<QuestionSelectionResult> {
    const apiUrl = `questions/questionsSelectedReOrder/${constituencyIDVoter}/${sortOrder}/${
      reversalOnly ? 'Y' : 'N'
    }`;

    return this.httpClientService
      .get(apiUrl)
      .pipe(map(returnData => this.CastToQuestionSelectionResult(returnData)));
  }

  QuestionUpdate(questionEdit: QuestionEdit): Observable<Kvp> {
    const apiUrl = 'questions/questionUpdate';

    const slashtags = questionEdit.tags.filter(
      tag => tag.tagByMe != tag.tagByMeNew
    );

    const postData = {
      questionID: questionEdit.questionID,
      question: questionEdit.question,
      details: questionEdit.details,
      draft: questionEdit.draft,
      TagsList: questionEdit.tags.filter(tag => tag.tagByMe != tag.tagByMeNew),
      constituencyID: questionEdit.constituencyID
    } as QuestionEditFormData;

    return this.httpClientService.post(apiUrl, postData);
  }

  QuestionDelete(
    questionID: number,
    constituencyID: number
  ): Observable<boolean> {
    return this.httpClientService
      .get(`questions/questionDelete/${questionID}/${constituencyID}`)
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
    add: boolean,
    questionID: number,
    pointID: number
  ): Observable<boolean> {
    var url = `questions/questionPoint/${
      add ? 'add' : 'remove'
    }/${questionID}/${pointID}`;
    return this.httpClientService.get(url);
  }
}
