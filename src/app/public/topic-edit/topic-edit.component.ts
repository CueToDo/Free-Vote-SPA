import { Component, Input, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-topic-edit',
  templateUrl: './topic-edit.component.html',
  styleUrls: ['./topic-edit.component.css']
})
export class TopicEditComponent {
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
  @Input() Topics: string[] = [];
  @Output() TopicsChange = new EventEmitter<string[]>();

  constructor() {}

  add(): void {
    this.check();

    if (!this.error) {
      const newTopic = this.newTopic.trim();
      if (!!newTopic && newTopic !== '/') {
        this.Topics.push(newTopic);
      }
      // Reset the input value
      this.newTopic = '';
    }
  }

  remove(topic: string): void {
    const index = this.Topics.indexOf(topic);

    if (index >= 0) {
      this.Topics.splice(index, 1);
    }
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
