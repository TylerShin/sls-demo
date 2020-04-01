import 'intersection-observer';
import raf from 'raf';
import StoreLib from 'store';
import expirePlugin from 'store/plugins/expire';
import React, { FC, useEffect } from 'react';
import { loadableReady } from '@loadable/component';
import * as Sentry from '@sentry/browser';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import App from '../components/app';
import theme from '../assets/muiTheme';
import { Provider } from 'react-redux';
import store from '../store';
import { ACTION_TYPES } from '@src/actions/actionTypes';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
import { loadKaTexStyleSheet } from './helpers/loadKaTexStyleSheet';
import { loadWebFont } from './helpers/loadWebFont';
import { loadScript } from './helpers/loadScript';
import { initializeGA } from './helpers/initializeGA';
import EnvChecker from '@src/helpers/envChecker';
const StyleContext = require('isomorphic-style-loader/StyleContext');

if (EnvChecker.isProdBrowser()) {
  Sentry.init({ dsn: 'https://90218bd0404f4e8e97fbb17279974c23@sentry.io/1306012' });
}

StoreLib.addPlugin(expirePlugin);

// Prevent IE/Edge's Clicking SVG problem
// https://stackoverflow.com/questions/38648307/add-blur-method-to-svg-elements-in-ie-edge
if (typeof (SVGElement.prototype as any).blur === 'undefined') {
  // tslint:disable-next-line:no-empty
  (SVGElement.prototype as any).blur = () => {};
}
// Set rAF polyfill for IE
raf.polyfill();

const insertCss = (...styles: any[]) => {
  const removeCss = styles.map(style => style._insertCss());
  return () => removeCss.forEach(dispose => dispose());
};

const ClientApp: FC = () => {
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <StyleContext.Provider value={{ insertCss }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StyleContext.Provider>
      </Provider>
    </ThemeProvider>
  );
};

loadKaTexStyleSheet();
loadWebFont();
loadScript({ src: 'https://apis.google.com/js/platform.js' });
loadScript({
  src: 'https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.min.js',
  crossOrigin: 'anonymous',
});
initializeGA();

loadableReady(() => {
  ReactDom.hydrate(<ClientApp />, document.getElementById('react-app'), () => {
    store.dispatch({
      type: ACTION_TYPES.GLOBAL_SUCCEEDED_TO_RENDER_AT_THE_CLIENT_SIDE,
      payload: { initialPageType: getCurrentPageType() },
    });
  });
});
