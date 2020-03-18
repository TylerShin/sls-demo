import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const enum UserDevice {
  DESKTOP = "DESKTOP",
  TABLET = "TABLET",
  MOBILE = "MOBILE"
}

export interface LayoutState {
  userDevice: UserDevice;
}

export const LAYOUT_INITIAL_STATE = { userDevice: UserDevice.DESKTOP };

const layoutSlice = createSlice({
  name: "layout",
  initialState: LAYOUT_INITIAL_STATE,
  reducers: {
    setDeviceType(state, action: PayloadAction<{ userDevice: UserDevice }>) {
      if (state.userDevice === action.payload.userDevice) return state;
      return { ...state, userDevice: action.payload.userDevice };
    }
  }
});

export const { setDeviceType } = layoutSlice.actions;

export default layoutSlice.reducer;
