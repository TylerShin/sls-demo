import { AppThunkAction } from '@src/store';
import { checkAuthStatus as checkAuth } from '@src/api/auth';
import { ACTION_TYPES } from '../actionTypes';
import { SignInResult } from '@src/api/types/auth';

export function checkAuthStatus(): AppThunkAction<Promise<SignInResult | undefined>> {
  return async (dispatch, _getState, { axios }) => {
    try {
      const checkLoggedInResult = await checkAuth(axios);

      dispatch({
        type: ACTION_TYPES.AUTH_SUCCEEDED_TO_CHECK_LOGGED_IN,
        payload: {
          user: checkLoggedInResult.member,
          loggedIn: checkLoggedInResult.loggedIn,
          oauthLoggedIn: checkLoggedInResult.oauthLoggedIn,
          ipInstitute: checkLoggedInResult.ipInstitute,
        },
      });

      return checkLoggedInResult;
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.AUTH_FAILED_TO_CHECK_LOGGED_IN,
      });
    }
  };
}
