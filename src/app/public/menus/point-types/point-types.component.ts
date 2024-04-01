// Angular
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

// Models
import { PointTypesEnum } from 'src/app/models/enums';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgClass } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-point-types',
    templateUrl: './point-types.component.html',
    styleUrls: ['./point-types.component.css'],
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgIf, MatIconModule, MatTooltipModule, NgClass]
})
export class PointTypesComponent implements OnInit {
  @Input() pointTypeID!: PointTypesEnum;

  @Output() PointTypeVote = new EventEmitter<PointTypesEnum>();

  PointTypesEnum = PointTypesEnum;

  constructor() {}

  ngOnInit(): void {}

  pointTypeVote(pointTypeID: PointTypesEnum): void {
    this.PointTypeVote.emit(pointTypeID);
  }
}
