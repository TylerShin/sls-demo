import React, { FC } from 'react';
import Routes from '../routes';
import DefaultHelmet from '../helmet';
import Header from '@src/components/header';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../../assets/root.scss');

const App: FC = () => {
  useStyles(s);

  return (
    <>
      <Header />
      <DefaultHelmet />
      <Routes />
    </>
  );
};

export default App;
