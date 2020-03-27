import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import loadable from '@loadable/component';
import {
  HOME_PATH,
  SEARCH_RESULT_PATH,
  PAPER_SHOW_PATH,
  AUTHOR_SEARCH_RESULT_PATH,
  AUTHOR_SHOW_PATH,
  COLLECTION_SHOW_PATH,
  JOURNAL_SHOW_PATH,
  COLLECTION_LIST_PATH,
  AUTH_PATH,
  USER_SETTINGS_PATH,
  KEYWORD_SETTINGS_PATH,
  PROFILE_LANDING_ENQUIRY_PATH,
  PROFILE_LANDING_PATH,
  PROFILE_REGISTER_PATH,
  PROFILE_EMAIL_VERIFY_PATH,
  PROFILE_ONBOARDING_PATH,
} from '../../constants/route';
import ErrorPage from '../../pages/error/errorPage';
import ArticleSpinner from '../spinner/articleSpinner';
import { LoadDataParams } from '@src/types/routes';
import { PaperShowMatchParams } from '@src/pages/paperShow/types';
import PaperShow from '@src/pages/paperShow';
import {
  fetchPaperShowData,
  fetchRefCitedPaperDataAtServer as fetchRefCitedPaperData,
} from '@src/pages/paperShow/sideEffect';
import { AuthorShowMatchParams } from '@src/pages/authorShow/types';
import { CollectionShowMatchParams } from '@src/pages/collectionShow/types';
import { JournalShowMatchParams } from '@src/pages/journalShow/types';

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
    path: AUTHOR_SEARCH_RESULT_PATH,
    component: loadable(() => import('../../pages/authorSearch'), {
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
  {
    path: AUTHOR_SHOW_PATH,
    component: loadable(() => import('../../pages/authorShow'), {
      fallback: <LoadingSpinner />,
    }),
    loadData: async (params: LoadDataParams<AuthorShowMatchParams>) => {
      const { fetchAuthorShowPageData } = await import('../../pages/authorShow/sideEffect');
      await Promise.all([fetchAuthorShowPageData(params)]);
    },
  },
  {
    path: COLLECTION_SHOW_PATH,
    component: loadable(() => import('../../pages/collectionShow'), {
      fallback: <LoadingSpinner />,
    }),
    loadData: async (params: LoadDataParams<CollectionShowMatchParams>) => {
      const { fetchCollectionShowData } = await import('../../pages/collectionShow/sideEffect');
      await Promise.all([fetchCollectionShowData(params)]);
    },
  },
  {
    path: JOURNAL_SHOW_PATH,
    component: loadable(() => import('../../pages/journalShow'), {
      fallback: <LoadingSpinner />,
    }),
    loadData: async (params: LoadDataParams<JournalShowMatchParams>) => {
      const { fetchJournalShowPageData } = await import('../../pages/journalShow/sideEffect');
      await Promise.all([fetchJournalShowPageData(params)]);
    },
  },
  {
    path: COLLECTION_LIST_PATH,
    component: loadable(() => import('../../pages/collections'), {
      fallback: <LoadingSpinner />,
    }),
    loadData: async (params: LoadDataParams<{ userId: string }>) => {
      const { getCollections } = await import('../../pages/collections/sideEffect');
      await Promise.all([getCollections(params)]);
    },
    exact: true,
  },
  {
    path: AUTH_PATH,
    component: loadable(() => import('../../pages/auth'), {
      fallback: <LoadingSpinner />,
    }),
  },
  {
    path: USER_SETTINGS_PATH,
    component: loadable(() => import('../../pages/userSettings'), {
      fallback: <LoadingSpinner />,
    }),
  },
  {
    path: KEYWORD_SETTINGS_PATH,
    component: loadable(() => import('../../pages/keywordSettings'), {
      fallback: <LoadingSpinner />,
    }),
  },
  {
    path: PROFILE_LANDING_ENQUIRY_PATH,
    component: loadable(() => import('../../pages/profileLanding/enquiry'), {
      fallback: <LoadingSpinner />,
    }),
    exact: true,
  },
  {
    path: PROFILE_LANDING_PATH,
    component: loadable(() => import('../../pages/profileLanding'), {
      fallback: <LoadingSpinner />,
    }),
    exact: true,
  },
  {
    path: PROFILE_REGISTER_PATH,
    component: loadable(() => import('../../pages/profileRegister'), {
      fallback: <LoadingSpinner />,
    }),
    exact: true,
  },
  {
    path: PROFILE_EMAIL_VERIFY_PATH,
    component: loadable(() => import('../../pages/profileVerifyEmail'), {
      fallback: <LoadingSpinner />,
    }),
    exact: true,
  },
  {
    path: PROFILE_ONBOARDING_PATH,
    component: loadable(() => import('../../pages/profileOnboarding'), {
      fallback: <LoadingSpinner />,
    }),
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
