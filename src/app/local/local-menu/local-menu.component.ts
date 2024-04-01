// Angular
import { Component } from '@angular/core';

// Models
import {
  PointSelectionTypes,
  PointFlags,
  TagCloudTypes
} from 'src/app/models/enums';
import { Point } from 'src/app/models/point.model';
import { ByComponent } from '../../base/by/by.component';
import { ConstituencyComponent } from '../constituency/constituency.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    templateUrl: './local-menu.component.html',
    styleUrls: ['./local-menu.component.css'],
    standalone: true,
    imports: [MatTabsModule, ConstituencyComponent, ByComponent]
})
export class LocalMenuComponent {
  selectedIndex = 0;
  PointSelectionTypes = PointSelectionTypes;
  PointFlags = PointFlags;

  point = new Point();

  public TagCloudTypes = TagCloudTypes;

  constructor() {}
}
