import { match } from 'react-router-dom';
import { AppDispatch } from '@src/store';

export interface LoadDataParams<P> {
  dispatch: AppDispatch;
  match: match<P>;
  pathname: string;
  queryParams?: any;
}
