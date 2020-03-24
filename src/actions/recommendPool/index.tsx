import RecommendationAPI from '@src/api/recommendation';
import {
  RECOMMENDED_PAPER_LOGGING_LENGTH_FOR_NON_USER,
  RECOMMENDED_PAPER_LOGGING_FOR_NON_USER,
} from '@src/constants/constants';
import { RecommendationActionParams } from '@src/api/types/recommendation';
import { AppThunkAction, AppDispatch } from '@src/store';
import { checkAuthStatus } from '../auth';
const store = require('store');

export const addPaperToRecommendPool = (recAction: RecommendationActionParams): AppThunkAction => {
  return async dispatch => {
    const recTempPool = store.get(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER) || [];

    const auth = await (dispatch as AppDispatch)(checkAuthStatus());
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
