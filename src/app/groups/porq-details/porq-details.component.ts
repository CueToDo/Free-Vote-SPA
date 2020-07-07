
// Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { AppDataService } from './../../services/app-data.service';

// Models, enums
import { PorQ } from 'src/app/models/porq.model';

@Component({
  selector: 'app-porq-details',
  templateUrl: './porq-details.component.html',
  styleUrls: ['./porq-details.component.css']
})
export class PorqDetailsComponent implements OnInit {

  porqId: number;

  porQ: PorQ;

  constructor(
    private activeRoute: ActivatedRoute,
    private appData: AppDataService) { }

  ngOnInit(): void {

    const routeParams = this.activeRoute.snapshot.params;

    this.porqId = routeParams.porqId;

    this.porQ = new PorQ();
    this.porQ.title = 'getting there';


  }

}
