export class Tag {
  tagDisplay = ''; // Not used in updating point or question tags in API
  slashTag = '';
  tagWeight = 0;
  unseenPoints = 0;
  myTag = false;
  otherVoterTag = false;
  newTag = false;

  constructor(slashTag: string) {
    this.slashTag = slashTag;
    this.newTag = true;
  }
}
