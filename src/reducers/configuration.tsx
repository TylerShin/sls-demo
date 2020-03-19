import { AnyAction } from '@reduxjs/toolkit';
import { ACTION_TYPES } from '../actions/actionTypes';
import { PageType } from '@src/constants/actionTicket';

export interface Configuration
  extends Readonly<{
    succeedAPIFetchAtServer: boolean;
    renderedAtClient: boolean;
    initialPageType: PageType;
  }> {}

export const CONFIGURATION_INITIAL_STATE: Configuration = {
  succeedAPIFetchAtServer: false,
  renderedAtClient: false,
  initialPageType: 'unknown',
};

export function reducer(state: Configuration = CONFIGURATION_INITIAL_STATE, action: AnyAction): Configuration {
  switch (action.type) {
    case ACTION_TYPES.GLOBAL_SUCCEEDED_TO_INITIAL_DATA_FETCHING: {
      return { ...state, succeedAPIFetchAtServer: true };
    }

    case ACTION_TYPES.GLOBAL_SUCCEEDED_TO_RENDER_AT_THE_CLIENT_SIDE: {
      return { ...state, renderedAtClient: true, initialPageType: action.payload.initialPageType };
    }

    default:
      return state;
  }
}
