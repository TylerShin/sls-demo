import { combineReducers } from "@reduxjs/toolkit";
import layout from "../reducers/layout";

const rootReducer = combineReducers({
  layout
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
