import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';

export interface PaperShowMatchParams {
  paperId: string;
}

export interface PaperShowPageQueryParams {
  'ref-page'?: number;
  'ref-sort'?: PAPER_LIST_SORT_OPTIONS;
  'ref-query'?: string;
  'cited-page'?: number;
  'cited-sort'?: PAPER_LIST_SORT_OPTIONS;
  'cited-query'?: string;
}

export type RefCitedTabItem = 'fullText' | 'ref' | 'cited';
