import axios, { CancelToken } from 'axios';
import { Dispatch } from 'redux';
import CollectionAPI, { RemovePapersFromCollectionParams, UpdatePaperNoteToCollectionParams } from '../../api/collection';
import MemberAPI from '../../api/member';
import { ActionCreators, ACTION_TYPES } from '../../actions/actionTypes';
import { AddPaperToCollectionParams } from '@src/api/collection';
import { closeSnackbar, openSnackbar, GLOBAL_SNACKBAR_TYPE } from '@src/reducers/scinapseSnackbar';
import { getMyCollections } from '../paperShow';
import PlutoAxios from '@src/api/pluto';
import alertToast from '@src/helpers/makePlutoToastAction';
import { Collection } from '@src/model/collection';

export function savePaperToCollection(params: AddPaperToCollectionParams) {
  return async (dispatch: Dispatch<any>) => {
    try {
      dispatch(ActionCreators.startToPostPaperToCollection());
      dispatch(closeSnackbar());

      await CollectionAPI.addPaperToCollection(params);

      dispatch(
        ActionCreators.succeededPostPaperToCollection({
          collection: params.collection,
        })
      );

      if (params.cancelToken) {
        dispatch(getMyCollections(params.paperId, params.cancelToken));
      }

      dispatch(
        openSnackbar({
          type: GLOBAL_SNACKBAR_TYPE.COLLECTION_SAVED,
          collectionId: params.collection.id,
          context: params.collection.title,
          actionTicketParams: {
            pageType: 'paperShow',
            actionType: 'view',
            actionArea: 'collectionSnackbar',
            actionTag: 'viewCollectionSnackBar',
            actionLabel: String(params.collection.id),
          },
        })
      );
    } catch (err) {
      dispatch(ActionCreators.failedToPostPaperToCollection());
      const error = PlutoAxios.getGlobalError(err);
      if (error) {
        alertToast({
          type: 'error',
          message: error.message,
        });
      }
    }
  };
}

export function removePaperFromCollection(params: RemovePapersFromCollectionParams) {
  return async (dispatch: Dispatch<any>) => {
    try {
      dispatch(ActionCreators.startToRemovePaperFromCollectionInPaperShow());

      await CollectionAPI.removePapersFromCollection(params);
      dispatch(
        ActionCreators.succeededToRemovePaperFromCollectionInPaperShow({
          collection: params.collection,
        })
      );

      if (params.cancelToken) {
        dispatch(getMyCollections(params.paperIds[0], params.cancelToken));
      }
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      dispatch(ActionCreators.failedToRemovePaperFromCollectionInPaperShow());
      alertToast({
        type: 'error',
        message: error.message,
      });
    }
  };
}

export function selectCollectionToCurrentCollection(collection: Collection) {
  return ActionCreators.selectCollection({ collection });
}

export function toggleNoteEditMode() {
  return ActionCreators.toggleNoteEditMode();
}

export function updatePaperNote(params: UpdatePaperNoteToCollectionParams) {
  return async (dispatch: Dispatch<any>) => {
    dispatch(ActionCreators.startToUpdatePaperNote());
    try {
      await CollectionAPI.updatePaperNoteToCollection(params);
      dispatch(ActionCreators.succeededToUpdatePaperNote(params));
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      dispatch(ActionCreators.failedToUpdatePaperNote());
      alertToast({
        type: 'error',
        message: 'Had an error when update the paper note to collection',
      });
      throw error;
    }
  };
}


export function getMember(memberId: number, cancelToken?: CancelToken) {
  return async (dispatch: Dispatch<any>) => {
    dispatch(ActionCreators.startToGetMemberInCollectionsPage());

    try {
      const res = await MemberAPI.getMember(memberId, cancelToken);

      dispatch(ActionCreators.addEntity(res));
      dispatch(
        ActionCreators.succeededToGetMemberInCollectionsPage({
          memberId: res.result,
        })
      );
    } catch (err) {
      if (!axios.isCancel(err)) {
        dispatch(ActionCreators.failedToGetMemberInCollectionsPage());
        dispatch({
          type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
          payload: {
            type: 'error',
            message: 'Sorry. Temporarily unavailable to get members.',
          },
        });
        throw err;
      }
    }
  };
}

export function getCollections(memberId: number, cancelToken?: CancelToken, itsMe?: boolean) {
  return async (dispatch: Dispatch<any>) => {
    dispatch(ActionCreators.startToGetCollectionsInCollectionsPage());

    try {
      const res = await MemberAPI.getCollections(memberId, cancelToken);

      dispatch(ActionCreators.addEntity(res));
      if (itsMe) {
        dispatch(ActionCreators.succeedToGetCollectionsInMember(res));
      } else {
        dispatch(ActionCreators.succeededToGetCollectionsInCollectionsPage(res));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        dispatch(ActionCreators.failedToGetCollectionsInCollectionsPage());
        dispatch({
          type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
          payload: {
            type: 'error',
            message: 'Sorry. Temporarily unavailable to get collections.',
          },
        });
        throw err;
      }
    }
  };
}
