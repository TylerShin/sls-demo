import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ACTION_TYPES } from '../actions/actionTypes';
import { KeywordSettingItemResponse } from '@src/api/types/member';

export interface KeywordSettingsState {
  isLoading: boolean;
  keywords: KeywordSettingItemResponse[];
}

export const KEYWORD_SETTINGS_INITIAL_STATE: KeywordSettingsState = { isLoading: false, keywords: [] };

const keywordSettingsSlice = createSlice({
  name: 'keywordSettings',
  initialState: KEYWORD_SETTINGS_INITIAL_STATE,
  reducers: {
    startToConnectKeywordSettingsAPI(state) {
      return { ...state, isLoading: true };
    },
    succeedToConnectKeywordSettingsAPI(state, action: PayloadAction<{ keywords: KeywordSettingItemResponse[] }>) {
      return { ...state, isLoading: false, keywords: action.payload.keywords };
    },
    failedToConnectKeywordSettingsAPI(state) {
      return { ...state, isLoading: false };
    },
  },
  extraReducers: {
    [ACTION_TYPES.AUTH_SUCCEEDED_TO_SIGN_OUT](state) {
      return { ...state, keywords: [] };
    },
  },
});

export const {
  startToConnectKeywordSettingsAPI,
  succeedToConnectKeywordSettingsAPI,
  failedToConnectKeywordSettingsAPI,
} = keywordSettingsSlice.actions;

export default keywordSettingsSlice.reducer;
