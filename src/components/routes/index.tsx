import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import loadable from '@loadable/component';
import { HOME_PATH, SEARCH_RESULT_PATH } from '../../constants/route';
import ErrorPage from '../../pages/error/errorPage';
import ArticleSpinner from '../spinner/articleSpinner';

interface RouteMap {
  path?: string;
  component?: any;
  exact?: boolean;
  render?: any;
}

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <ArticleSpinner />
    </div>
  );
};

const routesMap: RouteMap[] = [
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
