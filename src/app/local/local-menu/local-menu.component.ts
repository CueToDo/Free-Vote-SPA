// Angular
import { Component } from '@angular/core';

// Models
import {
  PointSelectionTypes,
  PointFlags,
  TagCloudTypes
} from 'src/app/models/enums';
import { Point } from 'src/app/models/point.model';

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

  constructor() {}
}
