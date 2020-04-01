import React, { useState, useEffect } from 'react';
import store from 'store';
import NoSsr from '@material-ui/core/NoSsr';
import { Button } from '@pluto_network/pluto-design-elements';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./cookieConsentBanner.scss');

const ACCEPT_COOKIE_KEY = 'a_c';
const BANNER_COOKIES_EXPIRED_DAY = 365;

type AcceptAnswer = 'true' | 'false';

const CookieConsentBanner: React.FC = () => {
  useStyles(s);
  const [acceptCookie, setAcceptCookie] = useState<AcceptAnswer>(
    (store.get(ACCEPT_COOKIE_KEY) as AcceptAnswer) || 'false'
  );

  useEffect(() => {
    setAcceptCookie((store.get(ACCEPT_COOKIE_KEY) as AcceptAnswer) || 'false');
  }, []);

  if (acceptCookie === 'true') return null;

  return (
    <NoSsr>
      <div className={s.bannerWrapper}>
        <div className={s.bannerText}>
          <div className={s.title}>This website uses cookies.</div>
          <div className={s.context}>
            We use cookies to improve your online experience. By continuing to use our website we assume you agree to
            the placement of these cookies.
            <br />
            To learn more, you can find in our{' '}
            <a className={s.link} href="https://scinapse.io/privacy-policy">
              Privacy Policy.
            </a>
          </div>
        </div>
        <div className={s.bannerButton}>
          <Button
            elementType="button"
            onClick={() => {
              setAcceptCookie('true');
              (store as any).set(
                ACCEPT_COOKIE_KEY,
                'true',
                new Date().getTime() + 1000 * 60 * 60 * 24 * BANNER_COOKIES_EXPIRED_DAY
              );
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </NoSsr>
  );
};

export default CookieConsentBanner;
