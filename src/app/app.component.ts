import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

//Rx
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import { FBTestComponent } from './fbtest/fbtest.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Free.Vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';

  ngOnInit() {

    let scene1: string = "beginning";
    let scene2: string = "middle";
    let scene3: string = "end";

    let viewer: Observer<string>;

    let film: Observable<string> = Observable.create(observer => {
      observer.next(scene1);
      observer.next(scene2);
      observer.next(scene3);
      observer.complete();
    });

    film.subscribe(
      (scene: string) => console.log(scene),
      error => console.error(error),
      () => console.log("Fin")
    );


  }

}
