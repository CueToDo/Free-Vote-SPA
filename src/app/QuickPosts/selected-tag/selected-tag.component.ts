import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ParamMap, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-selected-tag',
  templateUrl: './selected-tag.component.html',
  styleUrls: ['./selected-tag.component.css']
})
export class SelectedTagComponent implements OnInit {

  Tag: string;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.Tag = this.route.snapshot.paramMap.get('tag');
  }

}
