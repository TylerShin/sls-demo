import { CancelToken } from 'axios';

export interface SearchPapersParams {
  sort: string;
  page: number;
  query: string;
  filter: string;
  size?: number;
  cancelToken?: CancelToken;
  detectYear?: boolean;
}
