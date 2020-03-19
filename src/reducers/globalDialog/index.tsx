import { ACTION_TYPES, Actions } from '../../actions/actionTypes';
import { Collection } from '../../model/collection';
import { Paper, PaperFigure } from '../../model/paper';
import { OAuthCheckParams } from '../../api/types/auth';
import { SignUpConversionExpTicketContext } from '../../constants/abTest';
import { PaperProfile } from '../../model/profile';
import { GLOBAL_DIALOG_TYPE } from './types';
import { AvailableCitationType } from '@src/types/citeFormat';
import { ActionTagType } from '@src/constants/actionTicket';
import { SIGN_UP_STEP } from '@src/components/signup/types';
import { PendingPaper } from '@src/model/pendingPaper';

export interface DialogState
  extends Readonly<{
    isLoading: boolean;
    hasError: boolean;
    isOpen: boolean;
    type: GLOBAL_DIALOG_TYPE | null;

    signUpStep: SIGN_UP_STEP | null;
    oauthResult: OAuthCheckParams | null;
    userActionType: ActionTagType | undefined;
    authContext: SignUpConversionExpTicketContext | undefined;

    citationPaperId: string | undefined;
    citationText: string;
    isLoadingCitationText: boolean;
    activeCitationTab: AvailableCitationType;

    isLoadingMyCollections: boolean;
    hasErrorToCollectionDialog: boolean;
    myCollectionIds: number[];
    collectionDialogTargetPaperId: string | undefined;

    collection: Collection | undefined;

    authorListTargetPaper: Paper | undefined;
    profile: PaperProfile | undefined;

    isBlocked: boolean | undefined;

    nextSignUpStep: string | undefined;

    paperFigures: PaperFigure[] | undefined;
    currentPaperFigureIndex: number | undefined;
    viewDetailFigureTargetPaperId: string | undefined;

    targetPendingPaper: PendingPaper | undefined;
  }> {} // TODO: remove below attribute after finishing the experiment

export const DIALOG_INITIAL_STATE: DialogState = {
  isLoading: false,
  hasError: false,
  isOpen: false,
  type: null,
  // sign up dialog
  signUpStep: null,
  oauthResult: null,
  userActionType: undefined,
  authContext: undefined,
  // citation dialog
  citationPaperId: '',
  citationText: '',
  isLoadingCitationText: false,
  activeCitationTab: AvailableCitationType.APA,
  // collection dialog
  isLoadingMyCollections: false,
  hasErrorToCollectionDialog: false,
  myCollectionIds: [],
  collectionDialogTargetPaperId: undefined,
  // collection edit dialog
  collection: undefined,
  // author list dialog
  authorListTargetPaper: undefined,
  profile: undefined,
  // resolve pending paper dialog
  targetPendingPaper: undefined,
  // etc
  isBlocked: undefined,
  nextSignUpStep: undefined,
  paperFigures: undefined,
  currentPaperFigureIndex: undefined,
  viewDetailFigureTargetPaperId: undefined,
};

export function reducer(state: DialogState = DIALOG_INITIAL_STATE, action: Actions): DialogState {
  switch (action.type) {
    case ACTION_TYPES.GLOBAL_DIALOG_OPEN: {
      return {
        ...state,
        isOpen: true,
        type: action.payload.type,
        collectionDialogTargetPaperId: action.payload.collectionDialogTargetPaperId,
        citationPaperId: action.payload.citationDialogTargetPaperId,
        collection: action.payload.collection,
        authorListTargetPaper: action.payload.authorListTargetPaper,
        userActionType: action.payload.userActionType,
        authContext: action.payload.authContext,
        isBlocked: action.payload.isBlocked,
        nextSignUpStep: action.payload.nextSignUpStep,
        paperFigures: action.payload.paperFigures,
        currentPaperFigureIndex: action.payload.currentPaperFigureIndex,
        viewDetailFigureTargetPaperId: action.payload.viewDetailFigureTargetPaperId,
        profile: action.payload.profile,
        targetPendingPaper: action.payload.targetPendingPaper,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_CLOSE: {
      return DIALOG_INITIAL_STATE;
    }

    case ACTION_TYPES.GLOBAL_DIALOG_SET_BLOCKED: {
      return { ...state, isBlocked: true };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_UNSET_BLOCKED: {
      return { ...state, isBlocked: false };
    }

    case ACTION_TYPES.GLOBAL_CHANGE_DIALOG_TYPE: {
      return {
        ...state,
        type: action.payload.type,
        signUpStep: action.payload.signUpStep || null,
        oauthResult: action.payload.oauthResult || null,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_START_TO_GET_COLLECTIONS: {
      return {
        ...state,
        isLoadingMyCollections: true,
        hasErrorToCollectionDialog: false,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_SUCCEEDED_GET_COLLECTIONS: {
      return {
        ...state,
        myCollectionIds: action.payload.collectionIds,
        isLoadingMyCollections: false,
        hasErrorToCollectionDialog: false,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_FAILED_TO_GET_COLLECTIONS: {
      return {
        ...state,
        isLoadingMyCollections: false,
        hasErrorToCollectionDialog: true,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_START_TO_POST_COLLECTION: {
      return {
        ...state,
        isLoadingMyCollections: true,
        hasErrorToCollectionDialog: false,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_SUCCEEDED_POST_COLLECTION: {
      return {
        ...state,
        myCollectionIds: [action.payload.collectionId, ...state.myCollectionIds],
        isLoadingMyCollections: false,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_FAILED_TO_POST_COLLECTION: {
      return {
        ...state,
        isLoadingMyCollections: false,
        hasErrorToCollectionDialog: true,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_START_TO_GET_CITATION_TEXT: {
      return {
        ...state,
        isLoadingCitationText: true,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_SUCCEEDED_GET_CITATION_TEXT: {
      return {
        ...state,
        isLoadingCitationText: false,
        citationText: action.payload.citationText,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_FAILED_TO_GET_CITATION_TEXT: {
      return {
        ...state,
        isLoadingCitationText: false,
      };
    }

    case ACTION_TYPES.GLOBAL_DIALOG_CLICK_CITATION_TAB: {
      return {
        ...state,
        activeCitationTab: action.payload.tab,
      };
    }

    default:
      return state;
  }
}
