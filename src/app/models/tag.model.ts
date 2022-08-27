export class Tag {
  tagDisplay = '';
  slashTag = '';
  tagWeight = 0;
  embedded = false;
  unseenPoints = 0;
  pointOwnerTag = false;
  myConTag = false;
  otherVoterConTag = false;
  newTag = false;

  constructor(slashTag: string) {
    this.slashTag = slashTag;
    this.newTag = true;
    this.pointOwnerTag = true;
  }
}
