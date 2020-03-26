import { LoadDataParams } from '@src/types/routes';
import { AuthorShowMatchParams } from './types';
import { fetchAuthorShowRelevantData } from '@src/actions/author';
import { ActionCreators } from '@src/actions/actionTypes';

export async function fetchAuthorShowPageData(params: LoadDataParams<AuthorShowMatchParams>) {
  const { dispatch, match } = params;
  const authorId = match.params.authorId;

  if (isNaN(parseInt(authorId, 10))) {
    return dispatch(ActionCreators.failedToLoadAuthorShowPageData({ statusCode: 400 }));
  }

  await dispatch(
    fetchAuthorShowRelevantData({
      authorId,
    })
  );
}
