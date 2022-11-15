// Angular
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

// Models
import { PointTypesEnum } from 'src/app/models/enums';

@Component({
  selector: 'app-point-types',
  templateUrl: './point-types.component.html',
  styleUrls: ['./point-types.component.css']
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
