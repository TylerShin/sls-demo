import { AxiosInstance } from "axios";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

interface ThunkExtraArgument {
  axios: AxiosInstance;
}

const getServerStore = (extraArgument: ThunkExtraArgument) => {
  return configureStore({
    reducer: rootReducer,
    devTools: false,
    middleware: [
      ...getDefaultMiddleware({
        thunk: {
          extraArgument
        }
      })
    ]
  });
};

export default getServerStore;
