// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const apiUri = 'https://api.free.vote/';

export const environment = {
  production: true,
  facebookAppId: '802708376543547',
  auth: {
    domain: 'freevote.eu.auth0.com',
    clientId: '2R7Db5byd6g7h2K2oj3MUGoiHaoqnM1Y',
    authorizationParams: {
      audience: 'https://free.vote',
      redirect_uri: 'https://free.vote'
    },
    errorPath: ''
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`]
  },
  apiUri: apiUri
};
