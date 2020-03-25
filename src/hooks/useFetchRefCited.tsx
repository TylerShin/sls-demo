import { useEffect, useRef } from 'react';
import Axios from 'axios';
import { isEqual } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { CurrentUser } from '../model/currentUser';
import { ActionCreators } from '../actions/actionTypes';
import alertToast from '../helpers/makePlutoToastAction';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { AppState } from '@src/store/rootReducer';
import { fetchRefPaperData, fetchCitedPaperData } from '@src/pages/paperShow/sideEffect';
import { REF_CITED_CONTAINER_TYPE } from '@src/constants/paperShow';
import { AppDispatch } from '@src/store';

interface UseFetchRefCitedPapersParams {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
  page: string | undefined;
  query: string;
  sort: PAPER_LIST_SORT_OPTIONS;
}

export function useFetchRefCitedPapers({ type, paperId, page = '1', query, sort }: UseFetchRefCitedPapersParams) {
  const shouldFetch = useSelector(
    (state: AppState) => !state.configuration.succeedAPIFetchAtServer || state.configuration.renderedAtClient
  );

  const preventFetch = useRef(!shouldFetch);
  const currentUser: CurrentUser = useSelector((state: AppState) => state.currentUser, isEqual);
  const dispatch: AppDispatch = useDispatch();
  const fetchFunc = type === 'reference' ? fetchRefPaperData : fetchCitedPaperData;
  const failedActionCreator =
    type === 'reference' ? ActionCreators.failedToGetReferencePapers : ActionCreators.failedToGetCitedPapers;

  useEffect(() => {
    if (preventFetch.current) {
      preventFetch.current = false;
      return;
    }

    dispatch(fetchFunc(paperId, parseInt(page), query, sort)).catch(err => {
      if (!Axios.isCancel(err)) {
        alertToast({
          type: 'error',
          message: `Failed to get papers. ${err}`,
        });
        dispatch(failedActionCreator());
      }
    });
  }, [type, dispatch, paperId, page, query, sort, fetchFunc, failedActionCreator, currentUser.isLoggedIn]);
}
