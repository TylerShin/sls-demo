import { PAPER_LIST_SORT_OPTIONS } from '../../../types/search';

export interface SearchPageQueryParams {
  query?: string;
  filter?: string;
  page?: string;
  sort?: PAPER_LIST_SORT_OPTIONS;
}
