// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const apiUri = 'https://localhost:44389/';

export const environment = {
  production: false,
  facebookAppId: '802708376543547',
  auth: {
    domain: 'freevote.eu.auth0.com',
    clientId: '8LP3ZQ8EpAujVoTruLcI2YNsO0yQry9D',
    authorizationParams: {
      audience: 'https://free.vote',
      redirect_uri: window.location.origin
    },
    errorPath: ''
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`]
  },
  apiUri: apiUri
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
