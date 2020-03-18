import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchInputState {
  query: string;
  isOpenMobileBox: boolean;
}

export const SEARCH_INPUT_STATE: SearchInputState = {
  query: "",
  isOpenMobileBox: false
};

const SearchInputSlice = createSlice({
  name: "searchQuery",
  initialState: SEARCH_INPUT_STATE,
  reducers: {
    changeSearchInput(state, action: PayloadAction<{ query: string }>) {
      return { ...state, query: action.payload.query };
    },
    openMobileSearchBox(state) {
      return { ...state, isOpenMobileBox: true };
    },
    closeMobileSearchBox(state) {
      return { ...state, isOpenMobileBox: false };
    }
  }
});

export const {
  changeSearchInput,
  openMobileSearchBox,
  closeMobileSearchBox
} = SearchInputSlice.actions;

export default SearchInputSlice.reducer;
