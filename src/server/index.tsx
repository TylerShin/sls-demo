import fs from 'fs';
import path from 'path';
import React from 'react';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core/styles';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import getServerStore from '../store/serverStore';
import App from '../components/app';
import { generateHTML } from './helpers/generateHTML';
import theme from '../assets/muiTheme';
import { Provider } from 'react-redux';
import { getAxiosInstance } from '../api/axios';
const StyleContext = require('isomorphic-style-loader/StyleContext');

const STAGE = process.env['NODE_ENV'] || 'development';

const statsFile = path.resolve(__dirname, 'assets', 'loadable-stats.json');
let version = '';
try {
  version = fs.readFileSync('./dist/version').toString();
} catch (err) {
  version = '';
}

const publicPath = STAGE === 'local' ? process.env.ASSET_PATH : `assets/${STAGE}/${version}`;
const extractor = new ChunkExtractor({ statsFile, publicPath });

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
  const url = new URL(req.url);

  // normalize header keys
  const headers: { [key: string]: string | undefined } = {};
  for (const key of Object.keys(req.headers)) {
    const newKey = key.toLowerCase();
    if (newKey && req.headers[key]) {
      headers[newKey] = req.headers[key] as string;
    }
  }

  const axios = getAxiosInstance({
    headers: {
      cookie: headers.cookie || '',
      'user-agent': headers['user-agent'] || '',
      'x-forwarded-for': headers['x-forwarded-for'] || '',
      referer: headers.referer || '',
      'x-from-ssr': true,
    },
  });

  const store = getServerStore({ axios });

  // set styles made by Pluto
  const plutoCss = new Set();
  const insertCss = (...styles: any[]) => styles.forEach(style => plutoCss.add(style._getCss()));

  // set styles from Material-ui
  const sheets = new ServerStyleSheets();

  const jsx = extractor.collectChunks(
    <ChunkExtractorManager extractor={extractor}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StyleContext.Provider value={{ insertCss }}>
            <StaticRouter location={url.pathname}>
              <App />
            </StaticRouter>
          </StyleContext.Provider>
        </ThemeProvider>
      </Provider>
    </ChunkExtractorManager>
  );

  // make React rendering tree
  const jsxHTML = ReactDOMServer.renderToString(jsx);
  // extract script and style tags from React rendering tree
  const scriptTags = extractor.getScriptTags();
  const linkTags = extractor.getLinkTags();
  const styleTags = extractor.getStyleTags();
  const helmet = Helmet.renderStatic();
  const muiCss = sheets.toString();
  const preloadedState = store.getState();

  const html: string = await generateHTML({
    jsx: jsxHTML,
    linkTags,
    styleTags,
    scriptTags,
    helmet,
    muiCss,
    preloadedState,
    plutoCss: [...plutoCss].join(''),
  });

  context.res = {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
};

export default httpTrigger;
