
// Angular
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ServiceWorkerModule } from '@angular/service-worker';

// Material
import { MaterialModule } from './material.module';

// ngx-bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// Other
import { environment } from '../environments/environment';

// Services
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';

// Facebook
// import { FacebookModule } from 'ngx-facebook';
// import { FBTestComponent } from './fbtest/fbtest.component';

// Modules
import { CustomModule } from './custommodule/custom.module';
import { PublicModule } from './public/public.module';
import { OrganisationsModule } from './organisations/organisations.module';

// Global Singleton Services imported from Services Module
// https://angular.io/guide/singleton-services
// https://stackoverflow.com/questions/51502757/angular-service-singleton-constructor-called-multiple-times


// App Components
import { AppComponent } from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    // ReactiveFormsModule, // ToDo Remove
    HttpClientModule,
    AppRoutingModule,

    BsDropdownModule.forRoot(), // Bootstrap DropDowns
    // FacebookModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    CustomModule,
    PublicModule,
    OrganisationsModule
  ],
  declarations: [
    AppComponent
    // FBTestComponent
  ],
  // Singleton Services are provided in AppRoot
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
