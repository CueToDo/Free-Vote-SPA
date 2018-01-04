import { Component } from '@angular/core';
import { FBTestComponent } from './fbtest/fbtest.component';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthenticationService]
})
export class AppComponent {
  title = 'Free.Vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';
}
