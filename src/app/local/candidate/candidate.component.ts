// Angular
import { Component, Input } from '@angular/core';

// Models
import { Candidate } from 'src/app/models/candidate';
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent {
  @Input() candidate = new Candidate();
  @Input() candidateSelected = '';

  constructor(private appData: AppDataService) {}
  get selected(): boolean {
    // match on hyphenated surnames when full name is kebabed in url
    return (
      this.appData.kebabUri(this.candidate.name) ==
      this.appData.kebabUri(this.candidateSelected)
    );
  }
}
