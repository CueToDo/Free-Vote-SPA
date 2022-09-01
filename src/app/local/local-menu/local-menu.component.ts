// Angular
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Models
import {
  PointSelectionTypes,
  PointFlags,
  TagCloudTypes
} from 'src/app/models/enums';
import { Point } from 'src/app/models/point.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  templateUrl: './local-menu.component.html',
  styleUrls: ['./local-menu.component.css']
})
export class LocalMenuComponent {
  selectedIndex = 0;
  PointSelectionTypes = PointSelectionTypes;
  PointFlags = PointFlags;

  point = new Point();

  public TagCloudTypes = TagCloudTypes;

  constructor(private router: Router, private appDataService: AppDataService) {}

  newTopic(summat: Event): void {}
}
