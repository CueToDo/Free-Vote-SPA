import { PorQTypes } from './enums';

// Always use camelCase properties
// https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_Serialization_CamelCasePropertyNamesContractResolver.htm


import { ID } from './common';

export class PorQ {
  issueID: number;
  porQID: number;
  public porQTypeID: PorQTypes;
  porQ: string;
  title: string;
  porQOwner: boolean;

  points: number;
  feedback: number;
  voteCount: number;

  dateTime: string;
  latestActivity: string;

  supportLevel: number;
  adoptYNS: string;
  adopted: boolean;

  // Cannot access this as property or function even on deep copy cast as PorQ - WHY?
  // Use appData PorQType
  public get porQTypeDescription(): string {
    switch (this.porQTypeID) {
      case PorQTypes.Question:
        return 'Question';
      case PorQTypes.Perspective:
        return 'Perspective';
      case PorQTypes.Proposal:
        return 'Proposal';
    }
    return '';
  }

}

export class PorQSelectionResult {

  porQCount: number;

  porQIDs: ID[];
  fromDate: string;
  toDate: string;

  psOrQs: PorQ[];
}

export class PorQEdit {
  public issueID: number;
  public porQID: number;
  public porQTypeID: PorQTypes;
  public title: string;
  public porQ: string;
  public draft: boolean;
}
