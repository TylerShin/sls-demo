import { stringify } from 'qs';
import { SearchPageQueryParams } from '../pages/search/types';
import { SearchPapersParams } from '../api/types/paper';
import SafeURIDecoder from './safeURIDecoder';
import { PAPER_LIST_SORT_OPTIONS } from '../types/search';
import { isEmpty } from 'lodash';

export interface FilterObject {
  yearFrom: number | string;
  yearTo: number | string;
  fos: string[];
  journal: string[];
}

interface RawFilter {
  year: string;
  fos: string;
  journal: string;
}

export interface SearchPageQueryParamsObject {
  query: string;
  filter: Partial<FilterObject>;
  page: number;
  sort: PAPER_LIST_SORT_OPTIONS;
}

export const DEFAULT_FILTER: FilterObject = {
  yearFrom: 0,
  yearTo: 0,
  fos: [],
  journal: [],
};

class SearchQueryManager {
  public makeSearchQueryFromParamsObject(queryParams: SearchPageQueryParams): SearchPapersParams {
    const query = SafeURIDecoder.decode(queryParams.query ? queryParams.query : '');
    const searchPage = parseInt(queryParams.page ? queryParams.page : '0', 10) - 1 || 0;
    const filter = queryParams.filter;
    const sort = queryParams.sort;

    return {
      query,
      page: searchPage,
      filter: filter || '',
      sort: sort || '',
    };
  }

  public stringifyPapersQuery(queryParamsObject: SearchPageQueryParamsObject) {
    if (queryParamsObject.filter) {
      const formattedFilter = this.getStringifiedPaperFilterParams(queryParamsObject.filter);
      const formattedQueryParamsObject = {
        ...queryParamsObject,
        ...{ filter: formattedFilter, query: queryParamsObject.query },
      };

      return stringify(formattedQueryParamsObject);
    } else {
      return stringify(queryParamsObject);
    }
  }

  public objectifyPaperFilter(filterString?: string): FilterObject {
    if (!filterString) {
      return DEFAULT_FILTER;
    }

    const filter = filterString
      .split(',')
      .map(filter => {
        const keyValueArr = filter.split('=');
        const object: Partial<RawFilter> = { [keyValueArr[0]]: keyValueArr[1] };
        return object;
      })
      .reduce((prev, current) => {
        const mappedObject: Partial<FilterObject> = {};
        if (current.year) {
          const yearSet = current.year.split(':');
          let yearFrom: string | number = parseInt(yearSet[0], 10);
          let yearTo: string | number = parseInt(yearSet[1], 10);
          if (isNaN(yearFrom)) {
            yearFrom = '';
          }
          if (isNaN(yearTo)) {
            yearTo = '';
          }
          mappedObject.yearFrom = yearFrom;
          mappedObject.yearTo = yearTo;
        }
        if (current.journal) {
          mappedObject.journal = current.journal.split('|');
        }
        if (current.fos) {
          mappedObject.fos = current.fos.split('|');
        }

        return { ...prev, ...mappedObject };
      }, DEFAULT_FILTER);

    return filter;
  }

  public getStringifiedPaperFilterParams({ yearFrom, yearTo, fos, journal }: Partial<FilterObject>) {
    const resultQuery = `year=${yearFrom || ''}:${yearTo || ''},fos=${fos ? fos.join('|') : ''},journal=${
      journal ? journal.join('|') : ''
    }`;

    return resultQuery;
  }

  public isFilterEmpty(filter: Partial<FilterObject>) {
    return (
      !filter.yearFrom &&
      !filter.yearTo &&
      (!filter.fos || isEmpty(filter.fos)) &&
      (!filter.journal || isEmpty(filter.journal))
    );
  }
}

const searchQueryManager = new SearchQueryManager();

export default searchQueryManager;
