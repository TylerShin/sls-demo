import { CancelToken } from "axios";
import { Paper } from "../../model/paper";
import { PAPER_LIST_SORT_OPTIONS } from "../../constants/search";

export interface SearchPapersParams {
  sort: string;
  page: number;
  query: string;
  filter: string;
  size?: number;
  cancelToken?: CancelToken;
  detectYear?: boolean;
}

export interface GetRefOrCitedPapersParams {
  size?: number;
  paperId: string;
  page: number;
  query: string;
  sort: PAPER_LIST_SORT_OPTIONS | null;
}

export interface GetPapersResult {
  papers: Paper[];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: PAPER_LIST_SORT_OPTIONS | null;
  totalElements: number;
  totalPages: number;
}
