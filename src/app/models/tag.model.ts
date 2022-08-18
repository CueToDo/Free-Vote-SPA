export class Tag {
  tagDisplay = '';
  slashTag = '';
  tagWeight = 0;
  embedded = false;
  unseenPoints = 0;
  constituencyTag = false;
  myTag = false;

  constructor(slashTag: string) {
    this.slashTag = slashTag;
  }
}
