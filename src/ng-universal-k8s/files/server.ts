// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';

import * as config from './config';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = config.get('PORT') || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/<%= dasherize(projectName) %>-server/main');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as domino from 'domino';
import * as fs from 'fs';
const template = fs.readFileSync(join(DIST_FOLDER, '<%= dasherize(projectName) %>', 'index.html')).toString();
const win = domino.createWindow(template);
global['window'] = win;
global['document'] = win.document;

app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
        provideModuleMap(LAZY_MODULE_MAP)
    ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, '<%= dasherize(projectName) %>'));

// TODO: implement data requests securely
app.get('/api/*', (req, res) => {
    res.status(404).send('data requests are not supported');
});

// Server static files from /<%= dasherize(projectName) %>
app.get('*.*', express.static(join(DIST_FOLDER, '<%= dasherize(projectName) %>')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
    res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
    <% if(includeLogging){ %>logger.info(`Node server listening on http://localhost:${PORT}`);<% } else { %>console.log(`Node server listening on http://localhost:${PORT}`);<% } %>
});