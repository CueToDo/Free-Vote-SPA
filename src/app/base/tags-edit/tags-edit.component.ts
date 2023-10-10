// Angular
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Models
import { Tag } from 'src/app/models/tag.model';

@Component({
  selector: 'app-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.css']
})
export class TagsEditComponent {
  // 2 way bound in point-edit and question-edit components
  @Input() Tags: Tag[] = [];
  @Input() ConstituencyID = 0; // required to add new tags
  @Output() TagsChange = new EventEmitter<Tag[]>();

  addOnBlur = true;
  newSlashTag = '';

  illegalTags = [
    '/about',
    '/by',
    '/callback',
    '/card',
    '/group',
    '/groups',
    '/home',
    '/issues',
    '/my',
    '/organisations',
    '/new-point',
    '/new-question',
    '/point-of-the-week',
    '/privacy-policy',
    '/recent',
    '/scroller',
    '/search',
    '/tag',
    '/trending',
    '/voters'
  ];
  error = '';

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor() {}

  addNewTag(): void {
    this.check();

    if (!this.error) {
      const newSlashTag = this.newSlashTag.trim();
      if (!!newSlashTag && newSlashTag !== '/') {
        var tag = new Tag(newSlashTag, this.ConstituencyID);
        tag.tagByMe = false;
        tag.tagByMeNew = true;
        tag.tagByOther = false;
        this.Tags.push(tag);
      }
      // Reset the input value
      this.newSlashTag = '';
    }
  }

  // Update tagByMe ONLY
  addRemoveTag(topic: string, add: boolean): void {
    // get slashtag only using map to find index of tag in array
    const index = this.Tags.map(tag => tag.slashTag).indexOf(topic);
    var tag = this.Tags[index];
    tag.tagByMeNew = add;
    // Don't remove from the list - always give chance to re-add
  }

  // Update user input to correct slashTag format and ensure this is not an illegal tag
  check() {
    this.error = '';

    // https://stackoverflow.com/questions/1981349/regex-to-replace-multiple-spaces-with-a-single-space
    this.newSlashTag = (this.newSlashTag || '')
      .replace(/\s\s+/g, ' ')
      .split(' ')
      .join('-');

    // Add our tag
    // Ensured unique on server
    if (this.newSlashTag) {
      if (this.newSlashTag.charAt(0) !== '/') {
        this.newSlashTag = '/' + this.newSlashTag;
      }

      if (this.illegalTags.includes(this.newSlashTag.trim())) {
        this.error = `"${this.newSlashTag}" is not a permitted slash tag`;
      }
    }
  }
}
