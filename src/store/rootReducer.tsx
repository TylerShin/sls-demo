import { combineReducers } from '@reduxjs/toolkit';
import { reducer as searchFilterState } from '../reducers/searchFilter';
import { reducer as configuration } from '../reducers/configuration';
import { reducer as articleSearch } from '../reducers/articleSearch';
import { reducer as myCollections } from '../reducers/myCollections';
import { reducer as paperShow } from '../reducers/paperShow';
import { reducer as entities } from '../reducers/entity';
import { reducer as dialog } from '../reducers/globalDialog';
import { reducer as emailVerification } from '../reducers/emailVerification';
import { reducer as relatedPapersState } from '../reducers/relatedPapers';
import { reducer as PDFViewerState } from '../reducers/pdfViewer';
import { reducer as authorSearch } from '../reducers/authorSearch';
import layout from '../reducers/layout';
import currentUser from '../reducers/currentUser';
import searchInput from '../reducers/searchInput';
import createKeywordAlertDialogState from '../reducers/createKeywordAlertDialog';
import keywordSettingsState from '../reducers/keywordSettings';
import scinapseSnackbarState from '../reducers/scinapseSnackbar';
import searchQueryState from '../reducers/searchQuery';
import signUpModalState from '../reducers/signUpModal';
import profilePendingPaperListState from '../reducers/profilePendingPaperList';
import profileRepresentativePaperListState from '../reducers/profileRepresentativePaperList';
import profilePaperListState from '../reducers/profilePaperList';
import importPaperDialogState from '../reducers/importPaperDialog';
import profileOnboardingState from '../reducers/profileOnboarding';
import profileEntities from '../reducers/profileEntity';
import findInLibraryDialogState from '../reducers/findInLibraryDialog';

const rootReducer = combineReducers({
  layout,
  articleSearch,
  currentUser,
  searchInput,
  searchFilterState,
  dialog,
  createKeywordAlertDialogState,
  keywordSettingsState,
  scinapseSnackbarState,
  searchQueryState,
  configuration,
  emailVerification,
  signUpModalState,
  myCollections,
  paperShow,
  authorSearch,
  entities,
  profilePendingPaperListState,
  profileRepresentativePaperListState,
  profilePaperListState,
  importPaperDialogState,
  profileOnboardingState,
  relatedPapersState,
  PDFViewerState,
  findInLibraryDialogState,
  profileEntities,
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
