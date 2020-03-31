import ReactGA from 'react-ga';
import EnvChecker from '@src/helpers/envChecker';
import { getGAId, getOptimizeId } from '@src/helpers/handleGA';

export function initializeGA() {
  if (!EnvChecker.isBot()) {
    ReactGA.initialize(getGAId());

    const optimizeId = getOptimizeId();
    if (optimizeId) {
      ReactGA.ga()('require', optimizeId);
    }

    ReactGA.set({
      page: window.location.pathname + window.location.search,
    });
    ReactGA.pageview(window.location.pathname + window.location.search);
  }
}
