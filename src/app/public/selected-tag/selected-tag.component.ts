import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ParamMap, ActivatedRoute } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-selected-tag',
  templateUrl: './selected-tag.component.html',
  styleUrls: ['./selected-tag.component.css']
})
export class SelectedTagComponent implements OnInit, OnDestroy {

  private routeChangeSubscription: any;
  private Tag: string;

  constructor(private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    //https://angular-2-training-book.rangle.io/handout/routing/routeparams.html
    this.routeChangeSubscription = this.activatedRoute.params.subscribe(params => {
      this.Tag = params['tag'];
      console.log('SELECTED COMPONENT ROUTE CHANGED');
    });

  }

  ngOnDestroy() {
    this.routeChangeSubscription.unsubscribe();
  }

}
