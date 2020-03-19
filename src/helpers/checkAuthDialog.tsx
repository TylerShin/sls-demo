import store from '@src/store';
import ActionTicketManager from './actionTicketManager';
import { ActionArea, PageType, ActionTagType } from '@src/constants/actionTicket';
import { AppState } from '@src/store/rootReducer';
import { checkAuthStatus } from '@src/actions/auth/checkAuthStatus';
import { getCurrentPageType } from './getCurrentPageType';

export enum AUTH_LEVEL {
  UNSIGNED,
  UNVERIFIED,
  VERIFIED,
  ADMIN,
}

interface BlockByBenefitExpParams {
  authLevel: AUTH_LEVEL;
  actionArea: ActionArea | PageType;
  actionLabel: string | null;
  userActionType?: ActionTagType;
  expName?: string;
  isBlocked?: boolean;
  actionValue?: string;
}

export async function blockUnverifiedUser(params: BlockByBenefitExpParams): Promise<boolean> {
  const { authLevel, userActionType, actionArea, actionLabel, expName, isBlocked, actionValue } = params;
  const appState: AppState = store.getState();

  if (appState.currentUser.isLoggedIn && (appState.currentUser.oauthLoggedIn || appState.currentUser.emailVerified)) {
    return false;
  }

  const auth = await store.dispatch(checkAuthStatus());
  const isLoggedIn = auth && auth.loggedIn;
  const isVerified = auth && (auth.oauthLoggedIn || (auth.member && auth.member.emailVerified));

  if (isLoggedIn && isVerified) {
    return false;
  }

  if (authLevel > AUTH_LEVEL.UNSIGNED && !isLoggedIn) {
    GlobalDialogManager.openSignUpDialog({
      userActionType,
      authContext: {
        pageType: getCurrentPageType(),
        actionArea,
        actionLabel: expName ? expName : actionLabel,
        expName,
      },
      isBlocked: isBlocked || false,
    });

    ActionTicketManager.trackTicket({
      pageType: getCurrentPageType(),
      actionType: 'fire',
      actionArea,
      actionTag: 'blockUnsignedUser',
      actionLabel: expName ? expName : actionLabel,
      actionValue: actionValue ? actionValue : null,
      expName,
    });
    return true;
  }

  if (authLevel >= AUTH_LEVEL.VERIFIED && !isVerified) {
    GlobalDialogManager.openVerificationDialog();
    ActionTicketManager.trackTicket({
      pageType: getCurrentPageType(),
      actionType: 'fire',
      actionArea,
      actionTag: 'blockUnverifiedUser',
      actionLabel,
      actionValue: actionValue ? actionValue : null,
    });
    return true;
  }

  return false;
}
