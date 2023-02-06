import config from '../auth_config.dev.json';

const { domain, clientId, audience, apiUri, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: false,
  facebookAppId: '802708376543547',
  auth: {
    domain,
    clientId,
    ...(audience && audience !== 'YOUR_API_IDENTIFIER' ? { audience } : null),
    redirectUri: 'https://localhost:7027',
    errorPath
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`]
  },
  apiUri: apiUri
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
