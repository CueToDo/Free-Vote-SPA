import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})

export class AppSettingsModule {

  //public static ServiceUrl = 'http://freevote-002-site1.btempurl.com/';
  public static ServiceUrl = 'http://localhost:56529/';

  constructor() {
    console.log('cons');
  }

}

