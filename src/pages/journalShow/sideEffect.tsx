import { CancelToken } from 'axios';
import { Dispatch } from 'redux';
import { parse } from 'qs';
import { JournalShowMatchParams } from './types';
import { ActionCreators } from '../../actions/actionTypes';
import { LoadDataParams } from '@src/types/routes';
import { getJournal, getPapers } from '@src/actions/journal';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';

export interface JournalShowQueryParams {
  q?: string; // search query string
  p?: string; // page
  s?: PAPER_LIST_SORT_OPTIONS;
}

export function fetchPapers(journalId: string, queryParamsObj: JournalShowQueryParams, cancelToken?: CancelToken) {
  return async (dispatch: Dispatch<any>) => {
    await dispatch(
      getPapers({
        journalId,
        page: queryParamsObj && queryParamsObj.p ? parseInt(queryParamsObj.p, 10) : 1,
        query: queryParamsObj && queryParamsObj.q ? queryParamsObj.q : undefined,
        sort: queryParamsObj && queryParamsObj.s ? queryParamsObj.s : 'NEWEST_FIRST',
        cancelToken,
      })
    );
  };
}

export async function fetchJournalShowPageData(params: LoadDataParams<JournalShowMatchParams>) {
  const { dispatch, match, queryParams } = params;
  const queryParamsObj: JournalShowQueryParams = parse(queryParams, { ignoreQueryPrefix: true });

  const journalId = match.params.journalId;
  if (!journalId) {
    dispatch(ActionCreators.failedToGetJournal({ statusCode: 400 }));
    return;
  } else {
    const promiseArr: Promise<any>[] = [];
    promiseArr.push(getJournal(journalId)(dispatch));
    promiseArr.push(fetchPapers(journalId, queryParamsObj)(dispatch));
    await Promise.all(promiseArr);
  }
}
