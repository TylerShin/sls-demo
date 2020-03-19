import PlutoAxios from './pluto';
import { PaperSearchParams, SearchResult, BaseSearchParams, AuthorSearchResult } from './types/search';

class SearchAPI extends PlutoAxios {
  public async search({ query, sort, filter, page = 0, cancelToken, detectYear }: PaperSearchParams) {
    const res = await this.get('/search', {
      params: {
        q: query,
        sort,
        filter,
        page,
        yd: detectYear,
      },
      cancelToken,
    });

    const searchResult: SearchResult = res.data;
    const searchResultData = searchResult.data;

    return {
      ...searchResult,
      data: {
        ...searchResultData,
        page: {
          ...searchResultData.page,
          page: searchResultData.page ? searchResultData.page.page + 1 : 1,
        },
      },
    };
  }

  public async searchAuthor({ query, sort, page = 0, cancelToken }: BaseSearchParams) {
    const res = await this.get('/search/authors', {
      params: {
        q: query,
        sort,
        page,
      },
      cancelToken,
    });

    const searchResult: AuthorSearchResult = res.data;
    return {
      ...searchResult,
      data: {
        ...res.data.data,
        page: {
          ...res.data.data.page,
          page: res.data.data.page ? res.data.data.page.page + 1 : 1,
        },
      },
    };
  }
}

const searchAPI = new SearchAPI();

export default searchAPI;
