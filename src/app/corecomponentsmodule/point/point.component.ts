import { Component, OnInit, Input } from '@angular/core';

import { Point } from '../../coreservices/classes';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css']
})
export class PointComponent implements OnInit {

  @Input() point: Point;

  constructor() { }

  ngOnInit() {
  }

}
