import { AnyAction } from 'redux';
import { ACTION_TYPES } from '@src/actions/actionTypes';
import { AuthorSearchResult } from '@src/api/types/search';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { Author } from '@src/model/author/author';

export interface AuthorSearchState
  extends Readonly<{
    sort: PAPER_LIST_SORT_OPTIONS;
    isLoading: boolean;
    pageErrorCode: number | null;
    searchInput: string;
    page: number;
    numberOfElements: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isEnd: boolean;
    searchItemsToShow: Author[];
  }> {}

export const AUTHOR_SEARCH_INITIAL_STATE: AuthorSearchState = {
  sort: 'RELEVANCE',
  isLoading: false,
  pageErrorCode: null,
  searchInput: '',
  page: 1,
  numberOfElements: 0,
  totalElements: 0,
  totalPages: 0,
  isFirst: true,
  isEnd: false,
  searchItemsToShow: [],
};

export function reducer(state: AuthorSearchState = AUTHOR_SEARCH_INITIAL_STATE, action: AnyAction): AuthorSearchState {
  switch (action.type) {
    case ACTION_TYPES.ARTICLE_SEARCH_START_TO_GET_AUTHORS: {
      return {
        ...state,
        isLoading: true,
        pageErrorCode: null,
        searchInput: action.payload.query,
        sort: action.payload.sort,
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_AUTHORS: {
      const payload: AuthorSearchResult = action.payload;

      if (payload.data.page) {
        return {
          ...state,
          isLoading: false,
          pageErrorCode: null,
          isFirst: payload.data.page.first,
          isEnd: payload.data.page.last,
          page: payload.data.page.page,
          totalElements: payload.data.page.totalElements,
          totalPages: payload.data.page.totalPages,
          searchItemsToShow: payload.data.content,
        };
      }

      return state;
    }

    case ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_GET_AUTHORS: {
      return {
        ...state,
        isLoading: false,
        pageErrorCode: action.payload.statusCode,
      };
    }

    default: {
      return state;
    }
  }
}
