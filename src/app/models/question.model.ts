import { ID } from './common';

// Models, enums
import { Tag } from './tag.model';
import { PointSupportLevels } from './enums';

export class QuestionEdit {
  constituencyID = 0;
  questionID = 0;
  question = '';
  details = '';
  draft = false;
  tags: Tag[] = [];
}

export class QuestionEditFormData {
  constituencyID = 0;
  questionID = 0;
  question = '';
  details = '';
  draft = false;
  TagsList: Tag[] = [];
}

export class Question {
  question = '';
  details = '';
  slug = '';
  points = 0;
  draft = false;
  tags: Tag[] = [];
  questionID = 0;
  constituencyID = 0;
  rowNumber = 0;

  voterIDQuestion = 0;
  isQuestionOwner = false;

  created = '';
  updated = '';

  voted = ''; // Have voted?
  voteID = 0;
  votedDate = ''; // When?
  voteIsUpdatable = false; // Vote can be changed?
  supportLevelID = PointSupportLevels.None; // How? -1, 0 +1
  questionModified = false; // PointModified after Feedback Given
}

export class QuestionSelectionResult {
  // My server and client code agreed these should be capitalised,
  // but after updating to VS Angular project, framework intervenes and insists lower case
  tagID = 0;
  questionCount = 0;

  questionIDs: ID[] = [];

  questions: Question[] = [];
}
