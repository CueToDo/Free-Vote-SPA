export class Tag {
  tagID = 0;
  constituencyTag = false;
  constituencyID = 0;
  tagDisplay = ''; // Not used in updating point or question tags in API
  slashTag = '';
  tagWeight = 0;
  unseenPoints = 0;
  tagByOther = false;
  tagByMe = false;
  newTag = false;
  tagByMeNew = false;

  constructor(slashTag: string, constituencyID: number) {
    this.slashTag = slashTag;
    this.constituencyID = constituencyID;
    this.newTag = true;
  }
}
