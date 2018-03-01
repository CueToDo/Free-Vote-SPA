import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ParamMap, ActivatedRoute } from '@angular/router';

import { PointsService, PointSelectionTypes, Point } from '../../services/points.service';

@Component({
  //selector: 'app-posts', is router-outlet
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PointsComponent implements OnInit {


  //Subscriptions
  private routeChangeSubscription: any;
  private PointSelectionSubscription: any;

  //Controls
  form: FormGroup;
  dateFrom = new FormControl("");
  dateTo = new FormControl("");
  containingText = new FormControl("");

  //Private variables
  private tagRoute = "";
  private pointSelectionType = PointSelectionTypes.POTW;
  private points: Point[];
  private error: string;

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

      this.tagRoute="";

      if (params['tag'] != undefined) {
        this.tagRoute = params['tag'];
        this.pointSelectionType = PointSelectionTypes.Tag;
        debugger;
      }
      else {
        if (this.router.url == '/my/points') {
          this.pointSelectionType = PointSelectionTypes.MyPoints;
        }
        else if (this.router.url == '/my/favourite-points') {
          this.pointSelectionType = PointSelectionTypes.MyPoints;
        }
        else {
          this.pointSelectionType = PointSelectionTypes.Popular;
        }

      }

    });

    //initiate selection
    this.SelectPoints();
  }

  onSubmit() {
    this.SelectPoints();
  }

  SelectPoints() {

    this.PointSelectionSubscription = this.pointsService.SelectPoints(
        this.pointSelectionType, this.tagRoute, this.dateFrom.value, 
        this.dateTo.value, this.containingText.value)
      .subscribe(
        response => {
          console.log(response);
          this.dateFrom.setValue(response.FromDate);
          this.dateTo.setValue(response.ToDate);
          this.points = response.Points;
          debugger;
        },
        error => { this.error = error.error.error; },
        () => { })
  }

  ngOnDestroy() {
    this.PointSelectionSubscription.unsubscribe();
    this.routeChangeSubscription.unsubscribe();
  }




}
