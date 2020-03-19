import RecommendationAPI from '@src/api/recommendation';
import {
  RECOMMENDED_PAPER_LOGGING_LENGTH_FOR_NON_USER,
  RECOMMENDED_PAPER_LOGGING_FOR_NON_USER,
} from '@src/constants/constants';
import { RecommendationActionParams } from '@src/api/types/recommendation';
import { checkAuthStatus } from '@src/api/auth';
import { AppThunkAction } from '@src/store';

const store = require('store');

export const addPaperToRecommendPool = (recAction: RecommendationActionParams): AppThunkAction => {
  return async (dispatch, _getState, { axios }) => {
    const recTempPool = store.get(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER) || [];

    const auth = await dispatch(checkAuthStatus(axios));
    const isLoggedIn = auth && auth.loggedIn;

    if (!isLoggedIn) {
      const newRecActionLogs: RecommendationActionParams[] = [recAction, ...recTempPool].slice(
        0,
        RECOMMENDED_PAPER_LOGGING_LENGTH_FOR_NON_USER
      );

      store.set(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER, newRecActionLogs);
    } else {
      RecommendationAPI.addPaperToRecommendationPool({ paper_id: recAction.paperId, action: recAction.action });
    }
  };
};
