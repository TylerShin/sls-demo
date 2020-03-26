import { CollectionShowMatchParams } from './types';
import { ActionCreators } from '../../actions/actionTypes';
import { LoadDataParams } from '@src/types/routes';
import { getCollection, getPapers } from '@src/actions/collections';

export async function fetchCollectionShowData(params: LoadDataParams<CollectionShowMatchParams>) {
  const { dispatch, match } = params;

  const collectionId = parseInt(match.params.collectionId);
  if (isNaN(collectionId)) {
    return dispatch(
      ActionCreators.failedToGetCollectionInCollectionShow({
        statusCode: 400,
      })
    );
  } else {
    const promiseArr = [];
    promiseArr.push(dispatch(getCollection(collectionId)));
    promiseArr.push(
      dispatch(
        getPapers({
          collectionId,
          sort: 'RECENTLY_ADDED',
          page: 1,
        })
      )
    );
    await Promise.all(promiseArr);
  }
}
