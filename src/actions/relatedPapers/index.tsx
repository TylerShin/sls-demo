import Axios, { CancelToken } from 'axios';
import { normalize } from 'normalizr';
import { ActionCreators } from '../actionTypes';
import { AppThunkAction } from '@src/store';
import { paperSchema } from '@src/model/paper';

export function getRelatedPapers(paperId: string, cancelToken?: CancelToken): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    dispatch(ActionCreators.startToGetRelatedPapers());

    try {
      const getPapersResponse = await axios.get(`/papers/${paperId}/related`, { cancelToken });
      const papers = getPapersResponse.data.data;
      const res = normalize(papers, [paperSchema]);

      dispatch(ActionCreators.addEntity(res));
      dispatch(ActionCreators.getRelatedPapers({ paperIds: res.result }));
    } catch (err) {
      if (!Axios.isCancel(err)) {
        dispatch(ActionCreators.failedToGetRelatedPapers());
      }
    }
  };
}
