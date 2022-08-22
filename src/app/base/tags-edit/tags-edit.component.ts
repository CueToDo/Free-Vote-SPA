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
  addOnBlur = true;
  newTopic = '';
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

  // 2 way bound in point-edit component
  @Input() Tags: Tag[] = [];
  @Output() TagsChange = new EventEmitter<Tag[]>();

  @Input() IsMyPointEdit = false;

  constructor() {}

  addNewTag(): void {
    this.check();

    if (!this.error) {
      const newTopic = this.newTopic.trim();
      if (!!newTopic && newTopic !== '/') {
        var tag = new Tag(newTopic);
        tag.pointOwnerTag = this.IsMyPointEdit;
        tag.myConTag = !this.IsMyPointEdit;
        tag.otherVoterConTag = false;
        this.Tags.push(tag);
      }
      // Reset the input value
      this.newTopic = '';
    }
  }

  addRemoveTag(topic: string, add: boolean): void {
    // get slashtag only using map to find index of tag in array
    const index = this.Tags.map(tag => tag.slashTag).indexOf(topic);
    var tag = this.Tags[index];

    tag.myConTag = !this.IsMyPointEdit && add; // own or disown the pointTag

    if (this.IsMyPointEdit) {
      tag.pointOwnerTag = add;
    }

    // Don't ever remove from the list - always give chance to re-add
    // if (!add && this.IsMyPointEdit && !tag.newTag) {
    //   // Remove from the list
    //   this.Tags.splice(index, 1);
    // }
  }

  check() {
    this.error = '';

    // https://stackoverflow.com/questions/1981349/regex-to-replace-multiple-spaces-with-a-single-space
    this.newTopic = (this.newTopic || '')
      .replace(/\s\s+/g, ' ')
      .split(' ')
      .join('-');

    // Add our tag
    // Ensured unique on server
    if (this.newTopic) {
      if (this.newTopic.charAt(0) !== '/') {
        this.newTopic = '/' + this.newTopic;
      }

      if (this.illegalTags.includes(this.newTopic.trim())) {
        this.error = `"${this.newTopic}" is not a permitted slash tag`;
      }
    }
  }
}
