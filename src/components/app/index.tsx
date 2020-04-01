import React, { FC } from 'react';
import Routes from '../routes';
import DefaultHelmet from '../helmet';
import Header from '@src/components/header';
import DialogComponent from '../globalDialog';
import DeviceDetector from '../deviceDetector';
import LocationListener from '../locationListener';
import FeedbackButton from '../feedbackButton';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../../assets/root.scss');

const App: FC = () => {
  useStyles(s);

  return (
    <>
      <Header />
      <DefaultHelmet />
      <Routes />
      <DialogComponent />
      <DeviceDetector />
      <LocationListener />
      <FeedbackButton />
    </>
  );
};

export default App;
