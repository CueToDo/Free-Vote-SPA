// Angular
import { Component, Input } from '@angular/core';

// Models
import { Candidate } from 'src/app/models/candidate';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent {
  @Input() candidate = new Candidate();
}
