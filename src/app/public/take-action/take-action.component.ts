import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-take-action',
    templateUrl: './take-action.component.html',
    styleUrls: ['./take-action.component.css'],
    standalone: true,
    imports: [RouterLink]
})
export class TakeActionComponent {
  constructor() {}
}
