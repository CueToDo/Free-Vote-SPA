// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Models
import { PointSelectionTypes, PointFlags } from '../../models/enums';
import { Point } from '../../models/point.model';

// Services
import { AppDataService } from '../../services/app-data.service';


@Component({
  selector: 'app-points-menu',
  templateUrl: './voters-menu.component.html'
  // styleUrls: ['./voters-menu.component.css']
})
export class VotersMenuComponent implements OnInit {

  selectedIndex = 0;
  PointSelectionTypes = PointSelectionTypes;
  PointFlags = PointFlags;

  point = new Point();

  constructor(private router: Router, private appDataService: AppDataService) { }

  ngOnInit() {

  }



}
