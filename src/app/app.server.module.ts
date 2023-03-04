// Angular
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// App
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { AuthConfigService, AuthService } from '@auth0/auth0-angular';

@NgModule({
  imports: [AppModule, ServerModule, NoopAnimationsModule],
  providers: [
    {
      provide: AuthService,
      useValue: {}
    },
    { provide: AuthConfigService, useValue: {} as any }
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {
  // Separate Universal SSR and .NET Core backend API
  // https://github.com/TrilonIO/aspnetcore-angular-universal/issues/741
  //   Apologies for the delays everyone!
  // It seems that yes MS has unfortunately decided to give-up support for so many of
  // the underlying tools/libraries we need for not only Angular here, but React/Vue/etc.
  // (Namely spaservices/nodeservices/etc).
  // Very unfortunate that this all happened :(
  // Ideally the best way to go forward really is to use the Angular CLI
  // and utilize Universal that way which means using Node.js etc.
  // At least this way a separately spun up server can handle all of the front-end and SSR,
  // while potentially a separate Dotnet project could be the backend REST API only.
}
