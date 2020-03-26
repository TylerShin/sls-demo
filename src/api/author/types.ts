import { CancelToken } from 'axios';
import { Paper } from '../../model/paper';
import { PageObjectV2 } from '@src/types/pagination';
import { AUTHOR_PAPER_LIST_SORT_OPTIONS } from '@src/types/search';

export interface GetAuthorPapersParams {
  authorId: string;
  page: number;
  sort: AUTHOR_PAPER_LIST_SORT_OPTIONS;
  cancelToken?: CancelToken;
  query?: string;
  size?: number;
}

export interface AuthorPapersResponse {
  content: Paper[];
  page: PageObjectV2;
}

export interface GetAuthorPaperResult extends PageObjectV2 {
  entities: { papers: { [paperId: string]: Paper } };
  result: string[];
}
