import React, { FC } from 'react';
import Routes from '../routes';
import DefaultHelmet from '../helmet';
import Header from '@src/components/header';
import DialogComponent from '../globalDialog';
import DeviceDetector from '../deviceDetector';
import LocationListener from '../locationListener';
import FeedbackButton from '../feedbackButton';
import CookieConsentBanner from '../cookieConsentBanner';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../../assets/root.scss');

const App: FC = () => {
  useStyles(s);

  return (
    <>
      <DefaultHelmet />
      <Header />
      <Routes />
      <DialogComponent />
      <DeviceDetector />
      <LocationListener />
      <FeedbackButton />
      <CookieConsentBanner />
    </>
  );
};

export default App;
