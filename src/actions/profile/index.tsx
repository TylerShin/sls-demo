import { normalize } from 'normalizr';
import { profileEntitySchema, Profile } from '../../model/profile';
import { addProfileEntities } from '@src/reducers/profileEntity';
import alertToast from '../../helpers/makePlutoToastAction';
import { Paper, paperSchema } from '../../model/paper';
import { ActionCreators } from '../actionTypes';
import { getAllPapers, addPaper } from '@src/reducers/profilePaperList';
import {
  getPendingPapers,
  PendingPaper,
  removePendingPaper,
  markTryAgainPendingPaper,
  changeLoadingStatus,
} from '@src/reducers/profilePendingPaperList';
import { IMPORT_SOURCE_TAB, CURRENT_IMPORT_PROGRESS_STEP, CURRENT_ONBOARDING_PROGRESS_STEP } from '@src/types/profile';
import { changeProgressStep, fetchPaperImportResult, closeImportPaperDialog } from '@src/reducers/importPaperDialog';
import { clickNextStep, clickSkipStep } from '@src/reducers/profileOnboarding';
import {
  getRepresentativePapers,
  addRepresentativePapers,
  removeRepresentativePaper,
  addRepresentativePaper,
} from '@src/reducers/profileRepresentativePaperList';
import { AppThunkAction } from '@src/store';
import { PaginationResponseV2 } from '@src/types/pagination';
import { ImportedPaperListResponse, ProfileParams } from '@src/api/profile';

interface FetchProfilePaperListParams {
  profileSlug: string;
  size?: number;
  page?: number;
}

export function fetchRepresentativePapers(params: FetchProfilePaperListParams): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    const { profileSlug, size = 10 } = params;
    const res = await axios.get(`/profiles/${profileSlug}/papers/representative`, {
      params: { size: size },
    });
    const result: PaginationResponseV2<Paper[]> = res.data;
    const normalizedPapers = normalize(result.data.content, [paperSchema]);
    dispatch(ActionCreators.addEntity(normalizedPapers));
    dispatch(
      getRepresentativePapers({
        paperIds: normalizedPapers.result,
        totalPages: result.data.page!.totalPages,
        page: result.data.page!.page,
        totalElements: result.data.page!.totalElements,
      })
    );
  };
}

export function fetchProfileData(profileSlug: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    const res = await axios.get(`/profiles/${profileSlug}`);
    const profileData = { ...(res.data.data.content as Profile) };

    // const profileData = { ...(res.data.data.content as Profile), isEditable: false };
    const normalizedData = normalize(profileData, profileEntitySchema);
    dispatch(addProfileEntities(normalizedData.entities));
  };
}

export function updateProfile(params: Partial<ProfileParams> & { id: string }): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      const res = await axios.put(`/profiles/${params.id}`, params);
      const profileData = { ...(res.data.data.content as Profile) };

      // const profileData = { ...(res.data.data.content as Profile), isEditable: false };
      const normalizedData = normalize(profileData, profileEntitySchema);
      dispatch(addProfileEntities(normalizedData.entities));
    } catch (err) {
      alertToast({
        type: 'error',
        message: 'Had an error to update user profile.',
      });
    }
  };
}

export function fetchProfilePapers(params: FetchProfilePaperListParams): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    const { profileSlug, page } = params;
    const result = await axios.get(`/profiles/${profileSlug}/papers`, { params: { page } });
    const { data } = result.data as PaginationResponseV2<Paper[]>;
    const papers = data.content;
    const entity = normalize(papers, [paperSchema]);

    dispatch(ActionCreators.addEntity(entity));
    dispatch(
      getAllPapers({
        paperIds: entity.result,
        totalPages: data.page!.totalPages,
        page: data.page!.page,
        totalElements: data.page!.totalElements,
      })
    );
  };
}

export function fetchProfilePendingPapers(profileSlug: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    const result = await axios.get(`/profiles/${profileSlug}/papers/pending`);
    const { data } = result.data as PaginationResponseV2<PendingPaper[]>;
    const papers = data.content;

    dispatch(getPendingPapers({ papers }));
  };
}

export function controlStepAfterImportPaper(): AppThunkAction {
  return async (dispatch, getState) => {
    const { importPaperDialogState } = getState();
    const { isOnboarding, totalImportedCount, pendingCount } = importPaperDialogState;
    const activeStep = getState().profileOnboardingState.activeStep;

    if (totalImportedCount === 0 || totalImportedCount === pendingCount) {
      return alertToast({
        type: 'error',
        message: 'Had no result from imported paper. Try again',
      });
    }

    if (!isOnboarding) {
      return dispatch(changeProgressStep({ inProgressStep: CURRENT_IMPORT_PROGRESS_STEP.RESULT }));
    }

    dispatch(clickNextStep());

    if (activeStep === CURRENT_ONBOARDING_PROGRESS_STEP.UPLOAD_PUB_LIST && pendingCount === 0) {
      dispatch(clickSkipStep());

      if (totalImportedCount < 10) {
        dispatch(clickSkipStep());
      }
    }

    dispatch(closeImportPaperDialog());
  };
}

interface FetchProfileImportedPapersParams {
  importSource: IMPORT_SOURCE_TAB;
  profileSlug: string;
  importedContext: string | string[];
  isRepresentativeImporting?: boolean;
}
export function fetchProfileImportedPapers({
  importSource,
  profileSlug,
  importedContext,
  isRepresentativeImporting,
}: FetchProfileImportedPapersParams): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    let rawRes;
    try {
      if (importSource === IMPORT_SOURCE_TAB.GS) {
        rawRes = await axios.post(`/profiles/${profileSlug}/import-papers/gs`, {
          gs_uri: importedContext,
        });
      } else if (importSource === IMPORT_SOURCE_TAB.BIBTEX) {
        rawRes = await axios.post(`/profiles/${profileSlug}/import-papers/bibtex`, {
          bibtex_string: importedContext,
          mark_representative: isRepresentativeImporting,
        });
      } else if (importSource === IMPORT_SOURCE_TAB.CITATION) {
        rawRes = await axios.post(`/profiles/${profileSlug}/import-papers/citation`, {
          citation_string: importedContext,
          mark_representative: isRepresentativeImporting,
        });
      } else if (importSource === IMPORT_SOURCE_TAB.AUTHOR_URLS) {
        rawRes = await axios.post(`/profiles/${profileSlug}/import-papers/author`, {
          author_ids: importedContext,
        });
      }
    } catch (err) {
      throw err;
    }

    if (!rawRes) throw new Error();

    const res = rawRes.data.data.content as ImportedPaperListResponse;

    const allPapersRes = {
      data: { content: res.allPapers, page: res.allPaperPage },
    } as PaginationResponseV2<Paper[]>;
    const allPapers = allPapersRes.data.content;
    const allPapersEntity = normalize(allPapers, [paperSchema]);

    dispatch(ActionCreators.addEntity(allPapersEntity));

    dispatch(
      getAllPapers({
        paperIds: allPapersEntity.result,
        totalPages: allPapersRes.data.page!.totalPages,
        page: allPapersRes.data.page!.page,
        totalElements: allPapersRes.data.page!.totalElements,
      })
    );

    if (isRepresentativeImporting) {
      const representativePapersRes = {
        data: { content: res.representativePapers, page: res.representativePaperPage },
      } as PaginationResponseV2<Paper[]>;
      const representativePapers = representativePapersRes.data.content;
      const representativePapersEntity = normalize(representativePapers, [paperSchema]);
      dispatch(
        addRepresentativePapers({
          paperIds: representativePapersEntity.result,
          totalCount: representativePapersRes.data.page!.totalElements,
        })
      );
    }

    const pendingPapersRes = { data: { content: res.pendingPapers } } as PaginationResponseV2<PendingPaper[]>;
    const pendingPapers = pendingPapersRes.data.content;

    dispatch(getPendingPapers({ papers: pendingPapers }));

    dispatch(
      fetchPaperImportResult({
        totalImportedCount: res.totalImportedCount,
        successCount: res.successCount,
        pendingCount: res.pendingCount,
      })
    );

    dispatch(controlStepAfterImportPaper());
  };
}

export function removeProfilePendingPaper(paperId: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      await axios.delete(`/profiles/papers/pending/${paperId}`);
      dispatch(removePendingPaper({ paperId }));
    } catch (err) {
      throw err;
    }
  };
}

export function markTryAgainProfilePendingPaper(paperId: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      const res = await axios.post(`/profiles/papers/pending/${paperId}/try-again`);
      dispatch(markTryAgainPendingPaper({ paperId: res.data.data.content.id }));
    } catch (err) {
      throw err;
    }
  };
}

export function resolvedPendingPaper(pendingPaperId: string, paperId: string, authorId: string | null): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    dispatch(changeLoadingStatus({ isLoading: true }));
    try {
      const res = await axios.post(`/profiles/papers/pending/${pendingPaperId}/resolve`, {
        paper_id: paperId,
        author_id: authorId,
      });

      dispatch(removePendingPaper({ paperId: pendingPaperId }));
      dispatch(changeLoadingStatus({ isLoading: false }));

      const { data } = res.data as PaginationResponseV2<Paper>;
      const paper = data.content;
      const entity = normalize(paper, paperSchema);

      dispatch(ActionCreators.addEntity(entity));
      dispatch(addPaper({ paperId: paper.id }));
    } catch (err) {
      dispatch(changeLoadingStatus({ isLoading: false }));
      throw err;
    }
  };
}

export function markRepresentativePaper(paperId: string, profileSlug: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      await axios.post(`/profiles/${profileSlug}/papers/representative/mark`, {
        paper_id: paperId,
      });
      dispatch(addRepresentativePaper({ paperId }));
    } catch (err) {
      throw err;
    }
  };
}

export function unMarkRepresentativePaper(paperId: string, profileSlug: string): AppThunkAction {
  return async (dispatch, _getState, { axios }) => {
    try {
      await axios.post(`/profiles/${profileSlug}/papers/representative/unmark`, {
        paper_id: paperId,
      });
      dispatch(removeRepresentativePaper({ paperId }));
    } catch (err) {
      throw err;
    }
  };
}
