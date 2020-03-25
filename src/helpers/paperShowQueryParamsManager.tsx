import { stringify } from 'qs';
import { PaperShowPageQueryParams } from '@src/pages/paperShow/types';

export function getStringifiedUpdatedQueryParams(queryParamsObject: PaperShowPageQueryParams, pageQueryParams: any) {
  const updatedQueryParamsObject: PaperShowPageQueryParams = {
    ...queryParamsObject,
    ...pageQueryParams,
  };

  const stringifiedQueryParams = stringify(updatedQueryParamsObject, {
    addQueryPrefix: true,
  });

  return stringifiedQueryParams;
}
