import Axios from 'axios';
import { SearchPapersParams } from './types';
import SearchAPI from '@src/api/search';
import SearchQueryManager from '@src/helpers/searchQueryManager';
import { AppThunkAction } from '@src/store';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { ACTION_TYPES, SetActiveFilterBoxButtonAction } from '../actionTypes';
import PlutoAxios from '@src/api/pluto';
import { CommonError } from '@src/types/error';
import { FILTER_BUTTON_TYPE } from '@src/components/filterButton';
import { Paper } from '@src/model/paper';

export function searchPapers(params: SearchPapersParams): AppThunkAction<Promise<Paper[] | undefined>> {
  return async dispatch => {
    const filters = SearchQueryManager.objectifyPaperFilter(params.filter);

    dispatch({
      type: ACTION_TYPES.ARTICLE_SEARCH_START_TO_GET_PAPERS,
      payload: {
        query: params.query,
        sort: params.sort,
        filters,
      },
    });

    try {
      const res = await SearchAPI.search(params);
      dispatch({
        type: ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_PAPERS,
        payload: res,
      });

      const searchResult = res.data.content;
      const actionLabel = !searchResult || searchResult.length === 0 ? '0' : String(searchResult.length);

      ActionTicketManager.trackTicket({
        pageType: 'searchResult',
        actionType: 'view',
        actionArea: 'paperList',
        actionTag: 'pageView',
        actionLabel,
      });

      return searchResult;
    } catch (err) {
      if (!Axios.isCancel(err)) {
        const error = PlutoAxios.getGlobalError(err);

        dispatch({
          type: ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_GET_PAPERS,
          payload: {
            statusCode: (error as CommonError).status,
          },
        });

        ActionTicketManager.trackTicket({
          pageType: 'searchResult',
          actionType: 'view',
          actionArea: 'paperList',
          actionTag: 'pageView',
          actionLabel: 'error',
        });

        throw err;
      }
    }
  };
}

export function setActiveFilterButton(button: FILTER_BUTTON_TYPE | null): SetActiveFilterBoxButtonAction {
  return {
    type: ACTION_TYPES.ARTICLE_SEARCH_SET_ACTIVE_FILTER_BOX_BUTTON,
    payload: { button },
  };
}
