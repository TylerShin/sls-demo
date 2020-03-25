import React, { FC, useEffect, useRef } from 'react';
import Axios from 'axios';
import { isEqual } from 'lodash';
import { denormalize } from 'normalizr';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PaperShowMatchParams } from './types';
import { fetchPaperShowDataAtClient } from '../../actions/paperShow';
import ActionTicketManager from '../../helpers/actionTicketManager';
import getQueryParamsObject from '../../helpers/getQueryParamsObject';
import PaperShow from '@src/components/paperShow';
import { AppState } from '@src/store/rootReducer';
import { paperSchema } from '@src/model/paper';
import { UserDevice } from '@src/reducers/layout';
import { useFetchRefCitedPapers } from '@src/hooks/useFetchRefCited';
import { AppDispatch } from '@src/store';
import MobilePaperShow from '@src/components/mobilePaperShow';

type Props = RouteComponentProps<PaperShowMatchParams>;

const PaperShowContainer: FC<Props> = ({ location, match, history }) => {
  const dispatch: AppDispatch = useDispatch();
  const shouldFetch = useSelector(
    (state: AppState) => !state.configuration.succeedAPIFetchAtServer || state.configuration.renderedAtClient
  );
  const lastShouldFetch = useRef(shouldFetch);

  const paper = useSelector(
    (state: AppState) => denormalize(state.paperShow.paperId, paperSchema, state.entities),
    isEqual
  );
  const isMobile = useSelector((state: AppState) => state.layout.userDevice === UserDevice.MOBILE);
  const currentUser = useSelector((state: AppState) => state.currentUser, isEqual);
  const matchedPaperId = match.params.paperId;
  const paperId = paper && paper.id;

  const queryParams = getQueryParamsObject(location.search);
  const refPage = queryParams['ref-page'];
  const refQuery = queryParams['ref-query'] || '';
  const refSort = queryParams['ref-sort'] || 'NEWEST_FIRST';
  const citedPage = queryParams['cited-page'];
  const citedQuery = queryParams['cited-query'] || '';
  const citedSort = queryParams['cited-sort'] || 'NEWEST_FIRST';

  useFetchRefCitedPapers({
    type: 'reference',
    paperId: matchedPaperId,
    page: refPage,
    query: refQuery,
    sort: refSort,
  });

  useFetchRefCitedPapers({
    type: 'cited',
    paperId: matchedPaperId,
    page: citedPage,
    query: citedQuery,
    sort: citedSort,
  });

  useEffect(() => {
    if (paperId) {
      ActionTicketManager.trackTicket({
        pageType: 'paperShow',
        actionType: 'view',
        actionArea: '200',
        actionTag: 'pageView',
        actionLabel: String(paperId),
      });
    }
  }, [paperId]);

  useEffect(() => {
    const cancelToken = Axios.CancelToken.source();
    // NOTE: prevent fetching from the change of shouldFetch variable
    if (shouldFetch && !lastShouldFetch.current) {
      lastShouldFetch.current = true;
      return;
    }
    // NOTE: prevent double fetching
    if (!shouldFetch) return;

    dispatch(
      fetchPaperShowDataAtClient({
        paperId: matchedPaperId,
        cancelToken: cancelToken.token,
      })
    ).catch(err => {
      console.error(err);
      ActionTicketManager.trackTicket({
        pageType: 'paperShow',
        actionType: 'view',
        actionArea: String(err.status),
        actionTag: 'pageView',
        actionLabel: String(matchedPaperId),
      });
      history.push(`/${err.status}`);
    });

    return () => {
      cancelToken.cancel();
    };
  }, [location.pathname, currentUser.isLoggedIn, dispatch, matchedPaperId, shouldFetch, history]);

  if (!paper) return null;

  if (isMobile) return <MobilePaperShow paper={paper} />;
  return <PaperShow />;
};

export default withRouter(PaperShowContainer);
