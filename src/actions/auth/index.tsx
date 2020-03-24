import { AppThunkAction } from '@src/store';
import AuthAPI, {
  checkAuthStatus as checkAuth,
  signOut as callSignOut,
  checkOAuthStatus as callCheckOAuthStatus,
  signUpWithSocial as callSignUpWithSocial,
} from '@src/api/auth';
import RecommendationAPI from '@src/api/recommendation';
import { ACTION_TYPES } from '../actionTypes';
import {
  SignInResult,
  OAuthCheckResult,
  SignUpWithSocialParams,
  VerifyEmailResult,
  SignInWithEmailParams,
  SignUpWithEmailParams,
} from '@src/api/types/auth';
import { OAUTH_VENDOR } from '@src/constants/auth';
import { RecommendationActionParams } from '@src/api/types/recommendation';
import { RECOMMENDED_PAPER_LOGGING_FOR_NON_USER } from '@src/constants/constants';
import alertToast from '@src/helpers/makePlutoToastAction';
import { closeDialog } from '../globalDialog';
import { trackDialogView } from '@src/helpers/handleGA';
import PlutoAxios from '@src/api/pluto';

export function signOut(): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      if (confirm('Do you really want to sign out?')) {
        await callSignOut(axios);
        dispatch({
          type: ACTION_TYPES.AUTH_SUCCEEDED_TO_SIGN_OUT,
        });
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.AUTH_FAILED_TO_SIGN_OUT,
      });
      throw err;
    }
  };
}

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

export function checkOAuthStatus(
  vendor: OAUTH_VENDOR,
  token: string
): AppThunkAction<Promise<OAuthCheckResult | undefined>> {
  return async (_dispatch, _getState, { axios }) => {
    try {
      const res = await callCheckOAuthStatus(axios, vendor, token);
      return res;
    } catch (err) {
      console.error(err);
    }
  };
}

export async function checkDuplicatedEmail(email: string) {
  const checkDuplicatedEmailResult = await AuthAPI.checkDuplicatedEmail(email);
  if (checkDuplicatedEmailResult.duplicated) {
    return 'Email address already exists';
  }

  return null;
}

export function signUpWithSocial(params: SignUpWithSocialParams): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      await callSignUpWithSocial({ ...params, axios });
      await syncRecommendationPoolToUser();
      await dispatch(checkAuthStatus());
    } catch (err) {
      alertToast({
        type: 'error',
        message: `Failed to sign up!`,
      });
      throw err;
    }
  };
}

export function handleClickORCIDBtn() {
  const popup = window.open(
    'https://orcid.org/oauth/authorize?client_id=APP-BLJ5M8060XBHF7IR&response_type=token&scope=openid&redirect_uri=https://scinapse.io/',
    'orcidpopup',
    'width=800, height=600, toolbar=0, location=0, status=1, scrollbars=1, resizable=1'
  );

  const windowCheckInterval = setInterval(() => {
    windowCheck();
  }, 300);

  function windowCheck() {
    if (!popup || popup.closed) {
      clearInterval(windowCheckInterval);
      window.location.reload();
    }
  }
}

async function syncRecommendationPoolToUser() {
  const targetActions: RecommendationActionParams[] = store.get(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER) || [];

  if (targetActions.length > 0) {
    const reqParams = targetActions.map(targetAction => {
      return { paper_id: targetAction.paperId, action: targetAction.action };
    });
    await RecommendationAPI.syncRecommendationPool(reqParams);
    store.remove(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER);
  }
}

export function verifyToken(token: string): AppThunkAction {
  return async dispatch => {
    dispatch({
      type: ACTION_TYPES.EMAIL_VERIFICATION_START_TO_VERIFY_TOKEN,
    });

    try {
      const verifyEmailResult: VerifyEmailResult = await AuthAPI.verifyToken(token);

      if (!verifyEmailResult.success) {
        throw new Error('Server result is failed');
      }

      alertToast({
        type: 'success',
        message: 'Succeeded to email verification',
      });

      dispatch({
        type: ACTION_TYPES.EMAIL_VERIFICATION_SUCCEEDED_TO_VERIFY_TOKEN,
      });
    } catch (err) {
      alertToast({
        type: 'error',
        message: `Failed to verification. ${err}`,
      });
      dispatch({
        type: ACTION_TYPES.EMAIL_VERIFICATION_FAILED_TO_VERIFY_TOKEN,
      });
    }
  };
}

export function resendVerificationEmail(email: string, isDialog: boolean): AppThunkAction {
  return async dispatch => {
    dispatch({
      type: ACTION_TYPES.EMAIL_VERIFICATION_START_TO_RESEND_VERIFICATION_EMAIL,
    });

    try {
      const resendVerificationEmailResult: VerifyEmailResult = await AuthAPI.resendVerificationEmail(email);

      if (!resendVerificationEmailResult.success) {
        throw new Error('Server result is failed');
      }

      alertToast({
        type: 'success',
        message: 'Succeeded to resend verification email!!',
      });

      dispatch({
        type: ACTION_TYPES.EMAIL_VERIFICATION_SUCCEEDED_TO_RESEND_VERIFICATION_EMAIL,
      });

      if (isDialog) {
        dispatch(closeDialog());
        trackDialogView('resendVerificationEmailClose');
      }
    } catch (err) {
      alertToast({
        type: 'error',
        message: `Failed to resend email verification. ${err}`,
      });
      dispatch({
        type: ACTION_TYPES.EMAIL_VERIFICATION_FAILED_TO_RESEND_VERIFICATION_EMAIL,
      });
    }
  };
}

export function signInWithSocial(vendor: OAUTH_VENDOR, accessToken: string): AppThunkAction {
  return async dispatch => {
    const user = await AuthAPI.loginWithOAuth(vendor, accessToken);
    dispatch({
      type: ACTION_TYPES.SIGN_IN_SUCCEEDED_TO_SIGN_IN,
      payload: {
        user: user.member,
        loggedIn: user.loggedIn,
        oauthLoggedIn: user.oauthLoggedIn,
        ipInstitute: user.ipInstitute,
      },
    });
  };
}

export function signInWithEmail(
  params: SignInWithEmailParams,
  isDialog: boolean
): AppThunkAction<Promise<SignInResult | undefined>> {
  return async dispatch => {
    const { email, password } = params;

    try {
      const signInResult: SignInResult = await AuthAPI.signInWithEmail({ email, password });

      if (isDialog) {
        dispatch(closeDialog());
        trackDialogView('signInWithEmailClose');
      }

      alertToast({
        type: 'success',
        message: 'Welcome to Scinapse',
      });

      dispatch({
        type: ACTION_TYPES.SIGN_IN_SUCCEEDED_TO_SIGN_IN,
        payload: {
          user: signInResult.member,
          loggedIn: signInResult.loggedIn,
          oauthLoggedIn: signInResult.oauthLoggedIn,
          ipInstitute: signInResult.ipInstitute,
        },
      });
      return signInResult;
    } catch (err) {
      alertToast({
        type: 'error',
        message: `Failed to sign in.`,
      });
      const error = PlutoAxios.getGlobalError(err);
      throw error;
    }
  };
}

export function signUpWithEmail(params: SignUpWithEmailParams): AppThunkAction {
  return async dispatch => {
    try {
      await AuthAPI.signUpWithEmail(params);
      await syncRecommendationPoolToUser();
      await dispatch(checkAuthStatus());
      alertToast({
        type: 'success',
        message: 'Succeeded to Sign Up',
      });
    } catch (err) {
      alertToast({
        type: 'error',
        message: `Failed to sign up with email.`,
      });
      throw err;
    }
  };
}
