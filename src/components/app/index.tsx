import React, { FC } from 'react';
import Routes from '../routes';
import DefaultHelmet from '../helmet';
import Header from '@src/components/header';
import loadable from '@loadable/component';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../../assets/root.scss');

const DialogComponent = loadable(() => import('../globalDialog'));

const App: FC = () => {
  useStyles(s);

  return (
    <>
      <Header />
      <DefaultHelmet />
      <Routes />
      <DialogComponent />
    </>
  );
};

export default App;
