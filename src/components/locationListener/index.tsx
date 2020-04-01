import React from 'react';
import { connect } from 'react-redux';
import { parse, stringify } from 'qs';
import ReactGA from 'react-ga';
import { checkOAuthStatus } from '../../api/auth';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EnvChecker from '../../helpers/envChecker';
import ActionTicketManager from '../../helpers/actionTicketManager';
import getQueryParamsObject from '../../helpers/getQueryParamsObject';
import { ActionCreators } from '../../actions/actionTypes';
import GlobalDialogManager from '../../helpers/globalDialogManager';
import { AppDispatch } from '@src/store';
import { PageType } from '@src/constants/actionTicket';
import {
  HOME_PATH,
  SEARCH_RESULT_PATH,
  AUTHOR_SEARCH_RESULT_PATH,
  TERMS_OF_SERVICE_PATH,
  PRIVACY_POLICY_PATH,
  PAPER_SHOW_PATH,
  COLLECTION_SHOW_PATH,
  JOURNAL_SHOW_PATH,
  AUTHOR_SHOW_PATH,
  COLLECTION_LIST_PATH,
  AUTH_PATH,
  KEYWORD_SETTINGS_PATH,
} from '@src/constants/route';
import { signInWithSocial } from '@src/actions/auth';
import { GLOBAL_DIALOG_TYPE } from '@src/reducers/globalDialog/types';
import { SIGN_UP_STEP } from '../signUp/types';
import { getAxiosInstance } from '@src/api/axios';

interface LocationListenerProps extends RouteComponentProps<{}> {
  dispatch: AppDispatch;
}
export interface HistoryInformation {
  key: string;
  scrollPosition: number;
}

export const HISTORY_SESSION_KEY = 'historyStack';
const MAXIMUM_COUNT_TO_SAVE_HISTORY = 100;

export function getCurrentPageType(): PageType {
  if (!EnvChecker.isOnServer()) {
    const { pathname } = window.location;

    if (pathname === HOME_PATH) {
      return 'home';
    } else if (pathname === SEARCH_RESULT_PATH) {
      return 'searchResult';
    } else if (pathname === AUTHOR_SEARCH_RESULT_PATH) {
      return 'authorSearchResult';
    } else if (pathname === TERMS_OF_SERVICE_PATH) {
      return 'terms';
    } else if (pathname === PRIVACY_POLICY_PATH) {
      return 'privacyPolicy';
    } else if (pathname.startsWith(`/${PAPER_SHOW_PATH.split('/')[1]}`)) {
      return 'paperShow';
    } else if (pathname.startsWith(`/${COLLECTION_SHOW_PATH.split('/')[1]}`)) {
      return 'collectionShow';
    } else if (pathname.startsWith(`/${JOURNAL_SHOW_PATH.split('/')[1]}`)) {
      return 'journalShow';
    } else if (pathname.startsWith(`/${AUTHOR_SHOW_PATH.split('/')[1]}`)) {
      return 'authorShow';
    } else if (
      pathname.startsWith(`/${COLLECTION_LIST_PATH.split('/')[1]}`) &&
      pathname.endsWith(COLLECTION_LIST_PATH.split('/')[3])
    ) {
      return 'collectionList';
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith('sign_in')) {
      return 'signIn';
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith('sign_up')) {
      return 'signUp';
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith('reset-password')) {
      return 'resetPassword';
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith('email_verification')) {
      return 'emailVerification';
    } else if (pathname === KEYWORD_SETTINGS_PATH) {
      return 'keywordSettingPage';
    }

    return 'unknown';
  }

  return 'unknown';
}

class LocationListener extends React.PureComponent<LocationListenerProps> {
  public async componentDidMount() {
    const { location, dispatch } = this.props;

    if (!EnvChecker.isOnServer() && location.hash) {
      const hashParams = parse(location.hash.slice(1));
      if (
        hashParams &&
        hashParams.access_token &&
        hashParams.id_token &&
        hashParams.token_type &&
        hashParams.expires_in
      ) {
        const axios = getAxiosInstance();
        const status = await checkOAuthStatus(axios, 'ORCID', hashParams.id_token);
        if (status.isConnected) {
          await dispatch(signInWithSocial('ORCID', hashParams.id_token));
          ActionTicketManager.trackTicket({
            pageType: 'home',
            actionType: 'fire',
            actionArea: 'unknown',
            actionTag: 'signIn',
            actionLabel: 'ORCID',
            expName: '',
          });
          window.close();
        } else {
          dispatch(
            ActionCreators.changeGlobalDialog({
              type: GLOBAL_DIALOG_TYPE.SIGN_UP,
              signUpStep: SIGN_UP_STEP.WITH_SOCIAL,
              oauthResult: {
                email: status.email,
                firstName: status.firstName,
                lastName: status.lastName,
                token: hashParams.id_token,
                vendor: 'ORCID',
              },
            })
          );
          GlobalDialogManager.openSignUpDialog();
        }
      }
    }

    if (EnvChecker.isProdBrowser()) {
      this.trackPageView();
    }
  }

  public componentDidUpdate(prevProps: LocationListenerProps) {
    if (this.props.location !== prevProps.location) {
      // track page view at production mode
      if (EnvChecker.isProdBrowser()) {
        this.trackPageView();
        ReactGA.pageview(window.location.pathname + window.location.search);
      }

      // save scroll position
      let historyStack: HistoryInformation[] = JSON.parse(window.sessionStorage.getItem(HISTORY_SESSION_KEY) || '[]');
      const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      const historyInformation = { key: prevProps.location.key || 'initial', scrollPosition: scrollTop };
      const index = historyStack.findIndex(history => history.key === prevProps.location.key);
      if (index === -1) {
        historyStack = [historyInformation, ...historyStack];
      } else {
        historyStack = [...historyStack.slice(0, index), historyInformation, ...historyStack.slice(index + 1)];
      }
      if (historyStack.length > MAXIMUM_COUNT_TO_SAVE_HISTORY) {
        historyStack = historyStack.slice(0, MAXIMUM_COUNT_TO_SAVE_HISTORY);
      }
      window.sessionStorage.setItem(HISTORY_SESSION_KEY, JSON.stringify(historyStack));

      // handle dev branch demo
      const qs = getQueryParamsObject(prevProps.location.search);
      const nextQS = getQueryParamsObject(this.props.location.search);
      if (qs['branch'] && !nextQS['branch']) {
        const nextQPString = stringify({ ...nextQS, branch: qs['branch'] }, { addQueryPrefix: true });
        this.props.history.replace(this.props.location.pathname + nextQPString);
      }
    }
  }

  public render() {
    return null;
  }

  private trackPageView() {
    if (!EnvChecker.isOnServer()) {
      const urlArray = window.location.pathname.split('/');
      const id = parseInt(urlArray[urlArray.length - 1], 10);

      const currentPageType = getCurrentPageType();

      if (
        currentPageType !== 'searchResult' &&
        currentPageType !== 'authorSearchResult' &&
        currentPageType !== 'paperShow'
      ) {
        ActionTicketManager.trackTicket({
          pageType: getCurrentPageType(),
          actionType: 'view',
          actionArea: null,
          actionTag: 'pageView',
          actionLabel: !isNaN(id) ? String(id) : null,
        });
      }
    }
  }
}

export default connect()(withRouter(LocationListener));
