import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TakeActionComponent } from '../take-action/take-action.component';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    standalone: true,
    imports: [TakeActionComponent, RouterLink]
})
export class CardComponent {
  constructor() {}
}
