import { Component } from '@angular/core';
import { FBTestComponent } from './fbtest/fbtest.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Free.Vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';
}
