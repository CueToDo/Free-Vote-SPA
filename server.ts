import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';

import express from 'express';

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import bootstrap from './src/main.server';
import { existsSync } from 'node:fs';

const fs = require('fs');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  // 1. REDIRECT TO HTTPS
  server.use(function (req, res, next) {
    // if (!req.secure) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
    next();
  });

  // 2. Original
  // const distFolder = join(process.cwd(), 'dist/free-vote/browser');
  // const indexHtml = existsSync(join(distFolder, 'index.original.html'))
  //   ? 'index.original.html'
  //   : 'index';

  // 2. Set distFolder from current working directory
  const workingDirectory = process.cwd();
  const browserDistFolder = resolve(
    workingDirectory,
    '../../dist/free-vote/browser'
  );

  fs.readdir(workingDirectory, (err: any, files: any[]) => {
    files.forEach((file: any) => {
      fs.readFile(file, 'utf8', function (err: any, data: any) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
      });
    });
  });

  const indexHtml = join(browserDistFolder, 'index.html');

  console.log(
    `workingDirectory:${workingDirectory} BrowserDistFolder:${browserDistFolder} indexHtml:${indexHtml}`
  );

  //3. Original
  // server.set('view engine', 'html');
  // server.set('views', distFolder);

  // 3. server.set
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // 4. Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });

  //4a. Original
  // server.get(
  //   '*.*',
  //   express.static(distFolder, {
  //     maxAge: '1y'
  //   })
  // );

  // 4a. Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y'
    })
  );

  // 4b. Original
  // All regular routes use the Universal engine
  // server.get('*', (req, res) => {
  //   res.render(indexHtml, {
  //     req,
  //     providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
  //   });
  // });

  // 4b. All regular routes use the Angular engine

  const commonEngine = new CommonEngine();

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }]
      })
      .then(html => res.send(html))
      .catch(err => next(err));
  });

  // end function app()
  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
