import store from '@src/store';
import { ActionCreators } from '../../actions/actionTypes';
import { Collection } from '../../model/collection';
import { Paper, PaperFigure } from '../../model/paper';
import { SignUpConversionExpTicketContext as AuthContext } from '../../constants/abTest';
import { PaperProfile } from '../../model/profile';
import { ActionTagType } from '@src/constants/actionTicket';
import { PendingPaper } from '@src/model/pendingPaper';
import { GLOBAL_DIALOG_TYPE } from '@src/reducers/globalDialog/types';

interface OpenAuthDialogParams {
  authContext: AuthContext;
  userActionType?: ActionTagType;
  isBlocked?: boolean;
}

class GlobalDialogManager {
  public openSignInDialog(params?: OpenAuthDialogParams) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.SIGN_IN,
        userActionType: params && params.userActionType,
        authContext: params && params.authContext,
      })
    );
  }

  public openSignUpDialog(params?: OpenAuthDialogParams) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.SIGN_UP,
        userActionType: params && params.userActionType,
        authContext: params && params.authContext,
        isBlocked: params && params.isBlocked,
      })
    );
  }

  public openFinalSignUpWithEmailDialog() {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.FINAL_SIGN_UP_WITH_EMAIL,
        isBlocked: true,
      })
    );
  }

  public openFinalSignUpWithSocialDialog() {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.FINAL_SIGN_UP_WITH_SOCIAL,
        isBlocked: true,
      })
    );
  }

  public openVerificationDialog() {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.VERIFICATION_NEEDED,
      })
    );
  }

  public openResetPasswordDialog() {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.RESET_PASSWORD,
      })
    );
  }

  public openCitationDialog(targetPaperId: string) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.CITATION,
        citationDialogTargetPaperId: targetPaperId,
      })
    );
  }

  public openCollectionDialog(targetPaperId: string) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.COLLECTION,
        collectionDialogTargetPaperId: targetPaperId,
      })
    );
  }

  public openNewCollectionDialog(targetPaperId?: string) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.NEW_COLLECTION,
        collectionDialogTargetPaperId: targetPaperId,
      })
    );
  }

  public openEditCollectionDialog(collection: Collection) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.EDIT_COLLECTION,
        collection,
      })
    );
  }

  public openAuthorListDialog(paper: Paper, profile?: PaperProfile) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.AUTHOR_LIST_DIALOG,
        authorListTargetPaper: paper,
        profile,
      })
    );
  }

  public openPaperFigureDetailDialog(
    paperFigures: PaperFigure[],
    currentPaperFigureIndex: number,
    viewDetailFigureTargetPaperId: string
  ) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.PAPER_FIGURE_DETAIL,
        paperFigures,
        currentPaperFigureIndex,
        viewDetailFigureTargetPaperId,
      })
    );
  }

  public openResolvedPendingPaperDialog(targetPendingPaper: PendingPaper) {
    store.dispatch(
      ActionCreators.openGlobalDialog({
        type: GLOBAL_DIALOG_TYPE.RESOLVED_PENDING_PAPER,
        targetPendingPaper,
      })
    );
  }
}

const globalDialogManager = new GlobalDialogManager();

export default globalDialogManager;
