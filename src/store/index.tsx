import {
  configureStore,
  getDefaultMiddleware,
  Middleware,
  AnyAction
} from "@reduxjs/toolkit";
import { ThunkMiddleware } from "redux-thunk";
import { createLogger } from "redux-logger";
import { AxiosInstance } from "axios";
import rootReducer, { AppState } from "./rootReducer";
import { getAxiosInstance } from "../api/axios";
import ReduxNotifier from "../middlewares/notifier";
import setUserToTracker from "../middlewares/trackUser";

const preloadedState = (window as any).__INITIAL_STATE__;
delete (window as any).__INITIAL_STATE__;

const loggerMiddleware = createLogger({ collapsed: true });

const defaultMiddleware = getDefaultMiddleware<
  AppState,
  { thunk: { extraArgument: { axios: AxiosInstance } } }
>({
  thunk: { extraArgument: { axios: getAxiosInstance() } }
});
const middleware: Array<
  | Middleware<{}, AppState>
  | ThunkMiddleware<AppState, AnyAction, { axios: AxiosInstance }>
> = [...defaultMiddleware, ReduxNotifier, setUserToTracker, loggerMiddleware];

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware
});

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", () => {
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;

export default store;
