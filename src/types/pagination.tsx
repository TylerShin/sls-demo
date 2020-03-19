import { CommonError } from './error';

export interface CommonPaginationResponsePart {
  size: number;
  number: number;
  sort: string | null;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  totalPages: number;
  totalElements: number;
}

export interface PageObjectV2 {
  size: number;
  page: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationResponseV2<C> {
  data: {
    content: C;
    page: PageObjectV2 | null;
  };
  error: CommonError | null;
}

export interface NormalizedDataWithPaginationV2<E> {
  entities: E;
  result: string | string[];
  page: PageObjectV2 | null;
  error: CommonError | null;
}
