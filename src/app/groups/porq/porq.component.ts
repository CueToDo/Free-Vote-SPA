
// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Models, Enums
import { PorQ } from 'src/app/models/porq.model';
import { PorQTypes } from 'src/app/models/enums';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { PsandQsService } from 'src/app/services/psandqs.service';


@Component({
  selector: 'app-porq',
  templateUrl: './porq.component.html',
  styleUrls: ['./porq.component.css']
})
export class PorqComponent implements OnInit {

  @Input() public porQ: PorQ;
  @Output() Deleted = new EventEmitter();

  public PorQTypes = PorQTypes;

  porQEdit = false;
  deleted = false;
  error = '';

  public get detailsLink(): string {
    return `/groups/Compass-Manchester/Build-Back-Better/Making-Things-Happen-In-Manchester/${this.porQ.porQID}`;
  }

  constructor(
    private psAndQs: PsandQsService,
    private appData: AppDataService
  ) { }

  ngOnInit(): void {

  }

  edit() {
    this.porQEdit = true;
  }

  completeEdit(porQUpdated: PorQ) {
    this.porQ = <PorQ>this.appData.deep(porQUpdated);
    this.porQEdit = false;
  }

  cancelEdit() {
    this.porQEdit = false;
  }

  delete() {

    // CANNOT use public property on PorQ - WHY?
    // const pq = new PorQ; // : PorQ = <PorQ>this.appData.deep(this.porQ);
    // const pq: PorQ = <PorQ>this.appData.deep(this.porQ);
    // console.log(pq.porQTypeDescription);

    if (confirm(`Are you sure you wish to delete this ${this.appData.PorQType(this.porQ.porQTypeID)}?`)) {

      this.error = '';

      this.psAndQs.PorQDelete(this.porQ.issueID, this.porQ.porQID).subscribe(
        {
          next: _ => {
            this.deleted = true;
            this.Deleted.emit();
          },
          error: serverError => this.error = serverError.error.detail
        }
      );
    }
  }
}
