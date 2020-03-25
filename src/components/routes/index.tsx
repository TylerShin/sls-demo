import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import loadable from '@loadable/component';
import { HOME_PATH, SEARCH_RESULT_PATH, PAPER_SHOW_PATH } from '../../constants/route';
import ErrorPage from '../../pages/error/errorPage';
import ArticleSpinner from '../spinner/articleSpinner';
import { LoadDataParams } from '@src/types/routes';
import { PaperShowMatchParams } from '@src/pages/paperShow/types';
import PaperShow from '@src/pages/paperShow';
import {
  fetchPaperShowData,
  fetchRefCitedPaperDataAtServer as fetchRefCitedPaperData,
} from '@src/pages/paperShow/sideEffect';

interface RouteMap {
  path?: string;
  component?: any;
  exact?: boolean;
  render?: any;
  loadData?: (params: LoadDataParams<any>) => Promise<any>;
}

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <ArticleSpinner />
    </div>
  );
};

export const routesMap: RouteMap[] = [
  {
    path: HOME_PATH,
    exact: true,
    component: loadable(() => import('../../pages/home'), {
      fallback: <LoadingSpinner />,
    }),
  },
  {
    path: SEARCH_RESULT_PATH,
    component: loadable(() => import('../../pages/search'), {
      fallback: <LoadingSpinner />,
    }),
    exact: true,
  },
  {
    path: PAPER_SHOW_PATH,
    component: PaperShow,
    loadData: async (params: LoadDataParams<PaperShowMatchParams>) => {
      await Promise.all([fetchPaperShowData(params), fetchRefCitedPaperData(params)]);
    },
  },
  { component: ErrorPage },
];

const Routes: React.FC = () => {
  const location = useLocation();

  return (
    <Switch location={location}>
      {routesMap.map(route => (
        <Route {...route} key={route.path || 'errorPage'} />
      ))}
    </Switch>
  );
};

export default Routes;
