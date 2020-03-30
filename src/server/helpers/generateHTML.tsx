import { HelmetData } from 'react-helmet';
import { AppState } from '../../store/rootReducer';
const sprite = require('svg-sprite-loader/runtime/sprite.build');

interface Params {
  jsx: string;
  linkTags: string;
  styleTags: string;
  scriptTags: string;
  muiCss: string;
  plutoCss: string;
  preloadedState: AppState;
  helmet: HelmetData;
}

export function generateHTML({
  jsx,
  helmet,
  scriptTags,
  linkTags,
  styleTags,
  muiCss,
  preloadedState,
  plutoCss,
}: Params) {
  return `<!doctype html>
<html lang="en">
  <head>
    ${helmet.title.toString()}
    ${helmet.script.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${scriptTags}
    ${linkTags}
    ${styleTags}
    <style id="jss-server-side">${muiCss}</style>
    <style>${plutoCss}</style>
  </head>
  <body>
    <script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
    ${sprite.stringify()}
    <script>window.__INITIAL_STATE__=${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}</script>
    <div id="react-app">${jsx}</div>
  </body>
</html>`;
}
