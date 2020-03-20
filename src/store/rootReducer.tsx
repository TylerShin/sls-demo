import { combineReducers } from '@reduxjs/toolkit';
import { reducer as searchFilterState } from '../reducers/searchFilter';
import { reducer as configuration } from '../reducers/configuration';
import { reducer as articleSearch } from '../reducers/articleSearch';
import { reducer as myCollections } from '../reducers/myCollections';
import { reducer as paperShow } from '../reducers/paperShow';
import { reducer as entities } from '../reducers/entity';
import layout from '../reducers/layout';
import currentUser from '../reducers/currentUser';
import searchInput from '../reducers/searchInput';
import createKeywordAlertDialogState from '../reducers/createKeywordAlertDialog';
import keywordSettingsState from '../reducers/keywordSettings';
import scinapseSnackbarState from '../reducers/scinapseSnackbar';
import searchQueryState from '../reducers/searchQuery';
import signUpModalState from '../reducers/signUpModal';

const rootReducer = combineReducers({
  layout,
  articleSearch,
  currentUser,
  searchInput,
  searchFilterState,
  createKeywordAlertDialogState,
  keywordSettingsState,
  scinapseSnackbarState,
  searchQueryState,
  configuration,
  signUpModalState,
  myCollections,
  paperShow,
  entities,
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
