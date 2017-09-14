import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';

import { FacebookModule } from 'ngx-facebook';
import { FBTestComponent } from './fbtest/fbtest.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FBTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FacebookModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
