import { combineReducers } from "@reduxjs/toolkit";
import layout from "../reducers/layout";
import currentUser from "../reducers/currentUser";
import searchInput from "../reducers/searchInput";

const rootReducer = combineReducers({
  layout,
  currentUser,
  searchInput
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
