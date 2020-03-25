import { getPaper, getCitedPapers, getReferencePapers, getMyCollections } from '@src/actions/paperShow';
import { PaperShowMatchParams, PaperShowPageQueryParams } from './types';
import { ActionCreators } from '@src/actions/actionTypes';
import { getRelatedPapers } from '@src/actions/relatedPapers';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { AppThunkAction } from '@src/store';
import { LoadDataParams } from '@src/types/routes';

export function fetchCitedPaperData(
  paperId: string,
  page = 1,
  query: string,
  sort: PAPER_LIST_SORT_OPTIONS
): AppThunkAction<Promise<void>> {
  return async dispatch => {
    await dispatch(getCitedPapers({ paperId, page, query, sort }));
  };
}

export function fetchRefPaperData(
  paperId: string,
  page = 1,
  query: string,
  sort: PAPER_LIST_SORT_OPTIONS
): AppThunkAction<Promise<void>> {
  return async dispatch => {
    await dispatch(getReferencePapers({ paperId, page, query, sort }));
  };
}

export async function fetchRefCitedPaperDataAtServer(params: LoadDataParams<PaperShowMatchParams>) {
  const { dispatch, match, queryParams } = params;

  const paperId = match.params.paperId;
  const queryParamsObject: PaperShowPageQueryParams = queryParams ? queryParams : { 'cited-page': 1, 'ref-page': 1 };

  await Promise.all([
    dispatch(
      fetchCitedPaperData(
        paperId,
        queryParamsObject['cited-page'],
        queryParamsObject['cited-query'] || '',
        queryParamsObject['cited-sort'] || 'NEWEST_FIRST'
      )
    ),
    dispatch(
      fetchRefPaperData(
        paperId,
        queryParamsObject['ref-page'],
        queryParamsObject['ref-query'] || '',
        queryParamsObject['ref-sort'] || 'NEWEST_FIRST'
      )
    ),
  ]);
}

export async function fetchPaperShowData(params: LoadDataParams<PaperShowMatchParams>) {
  const { dispatch, match } = params;
  const paperId = match.params.paperId;

  if (!paperId) return dispatch(ActionCreators.failedToGetPaper({ statusCode: 400 }));

  const promiseArray = [];
  promiseArray.push(dispatch(getPaper({ paperId })));
  promiseArray.push(dispatch(getRelatedPapers(paperId)));
  promiseArray.push(dispatch(getMyCollections(paperId)));

  await Promise.all(promiseArray);
}
