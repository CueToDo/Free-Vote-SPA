import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterModule, ParamMap, ActivatedRoute } from '@angular/router';

import { PointsService, PointSelectionTypes } from '../../services/points.service';

@Component({
  //selector: 'app-posts',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PointsComponent implements OnInit {

  //Subscriptions
  private routeChangeSubscription: any;
  private PointsSelectedSubscription: any;
  private PointsSelectionErrorSubscription: any;
  
  private pointSelectionType = PointSelectionTypes.POTW;
  private Tag: string;
  private error: string;

  //Controls
  form: FormGroup;
  dateFrom = new FormControl("");
  dateTo = new FormControl("");
  containingText = new FormControl("");

  constructor(private formBuilder: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private pointsService: PointsService) {
    //detect what type of selection is required from route
    this.pointsService.PointSelectionType = PointSelectionTypes.MyPoints;

    this.form = formBuilder.group({
      "dateFrom": this.dateFrom,
      "dateTo": this.dateTo,
      "containingText": this.containingText
    });
  }

  ngOnInit() {

    //need to detect route to determine point selection type

    //https://angular-2-training-book.rangle.io/handout/routing/routeparams.html
    //Need to do following to get route params
    this.routeChangeSubscription = this.activatedRoute.params.subscribe(params => {

      console.log('POINTS COMPONENT ROUTE CHANGED');

      if (params['tag'] != undefined) {
        this.Tag = params['tag'];
        this.pointSelectionType = PointSelectionTypes.Tag;
      }
      else {
        if (this.router.url == '/private/my-posts') {
          this.Tag = "My Posts";
          this.pointSelectionType = PointSelectionTypes.MyPoints;
        }
        else {
          this.Tag = "Other";
          this.pointSelectionType = PointSelectionTypes.Popular;
        }

      }

    });

    //subscribe to completion of point selection
    this.PointsSelectedSubscription = this.pointsService.PointsSelected.subscribe(
      () => this.PointsSelected()
    )

    //subscribe to points selection error
    this.PointsSelectionErrorSubscription = this.pointsService.PointsSelectionError.subscribe(
      error => this.error = error
    )
    //initiate selection
    this.SelectPoints();
  }




  onSubmit() {
    this.SelectPoints();
  }

  ngOnDestroy() {
    this.PointsSelectedSubscription.unsubscribe();
    this.PointsSelectionErrorSubscription.unsubscribe();
    this.routeChangeSubscription.unsubscribe();
  }

  SelectPoints(){
    debugger;
    this.pointsService.SelectPoints(this.pointSelectionType, this.dateFrom.value, this.dateTo.value, this.containingText.value);
  }

  PointsSelected() {
    console.log('points successfully selected: now get and display');
  }

}
