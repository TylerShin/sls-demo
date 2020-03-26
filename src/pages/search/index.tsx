import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { parse } from 'qs';
import classNames from 'classnames';
import NoSsr from '@material-ui/core/NoSsr';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withStyles } from '../../helpers/withStyles';
import SearchQueryManager from '../../helpers/searchQueryManager';
import NoResult from './components/noResult';
import NoResultInSearch from '../../components/noResultInSearch';
import TabNavigationBar from '@src/components/tabNavigationBar';
import PaperSearchResultInfo from './components/PaperSearchResultInfo';
import ErrorPage from '../error/errorPage';
import { searchPapers } from '@src/actions/search';
import SearchList from './components/searchList';
import DoiSearchBlocked from './components/doiSearchBlocked';
import { Paper } from '../../model/paper';
import AuthorSearchItem from '@src/components/authorSearchItem';
import restoreScroll from '@src/helpers/restoreScroll';
import { SearchPageQueryParams } from './types';
import Pagination from './components/pagination';
import FilterBox from '@src/components/filterBox';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import SafeURIDecoder from '@src/helpers/safeURIDecoder';
import Footer from '@src/components/footer';
import EmailBanner from './components/emailBanner';
import CreateAlertButton from './components/createAlertButton';
import { changeSearchQuery } from '../../reducers/searchQuery';
import { AppState } from '../../store/rootReducer';
import { MatchAuthor } from '@src/api/types/search';
import CreateKeywordAlertDialog from '@src/components/createKeywordAlertDialog';
import { AppDispatch } from '@src/store';
import { FilterObject } from '@src/types/search';
const styles = require('./search.scss');

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<any> & {
    search: Paper[];
  };

const SearchHelmet: React.FC<{ query: string }> = ({ query }) => {
  return (
    <Helmet>
      <title>{`${query} | Search | Scinapse`}</title>
    </Helmet>
  );
};

interface AuthorSearchResult {
  isLoading: boolean;
  matchAuthors: MatchAuthor | null;
  shouldShow: boolean;
  queryParams: SearchPageQueryParams;
}
const AuthorSearchResult: React.FC<AuthorSearchResult> = React.memo(
  ({ matchAuthors, shouldShow, queryParams, isLoading }) => {
    if (isLoading || !shouldShow || !matchAuthors || matchAuthors.content.length === 0) return null;
    const authorCount = matchAuthors.totalElements;
    const authors = matchAuthors.content;

    const moreAuthorPage = (
      <Link
        to={{
          pathname: '/search/authors',
          search: SearchQueryManager.stringifyPapersQuery({
            query: queryParams.query || '',
            sort: 'RELEVANCE',
            filter: {},
            page: 1,
          }),
        }}
        className={styles.moreAuthorLink}
      >
        Show All Author Results >
      </Link>
    );

    const authorItems = authors.slice(0, 2).map(author => {
      return <AuthorSearchItem authorEntity={author} key={author.id} />;
    });

    return (
      <div className={styles.authorItemSectionWrapper}>
        <div className={styles.authorItemsHeader}>
          <h1 className={styles.categoryHeader}>Author</h1>
          <div className={styles.categoryCount}>
            {authorCount}
            {authorCount > 1 ? ' authors' : ' author'}
          </div>
          {authorCount <= 2 ? null : moreAuthorPage}
        </div>
        <div className={styles.authorItemsWrapper}>{authorItems}</div>
      </div>
    );
  }
);

const SearchResult: React.FC<Props & {
  queryParams: SearchPageQueryParams;
  filter: FilterObject;
}> = props => {
  const { articleSearchState, currentUserState, queryParams, filter, location, layout } = props;

  const hasNoSearchResult =
    (!articleSearchState.searchItemsToShow || articleSearchState.searchItemsToShow.length === 0) && queryParams;
  const hasNoMatchedAuthors =
    !articleSearchState.matchAuthors ||
    (articleSearchState.matchAuthors && articleSearchState.matchAuthors.totalElements === 0);
  const hasNoSearchResultAndNoAuthorResult = hasNoSearchResult && hasNoMatchedAuthors;
  const hasNoSearchResultButHasAuthorResult = hasNoSearchResult && !hasNoMatchedAuthors;
  const blockedDoiMatchedSearch =
    !currentUserState.isLoggedIn && articleSearchState.doiPatternMatched && !hasNoSearchResult;

  if (articleSearchState.isContentLoading) {
    return (
      <div className={styles.loadingContainer}>
        <ArticleSpinner className={styles.loadingSpinner} />
      </div>
    );
  }

  if (hasNoSearchResultButHasAuthorResult) {
    return (
      <div className={styles.innerContainer}>
        <FilterBox />
        <NoResultInSearch
          searchText={queryParams.query}
          otherCategoryCount={articleSearchState.totalElements}
          type="paper"
        />
      </div>
    );
  }

  if (hasNoSearchResultAndNoAuthorResult) {
    return (
      <div className={styles.innerContainer}>
        <FilterBox />
        <NoResult
          searchText={
            articleSearchState.suggestionKeyword.length > 0
              ? articleSearchState.suggestionKeyword
              : queryParams.query || ''
          }
          articleSearchState={articleSearchState}
          hasEmptyFilter={SearchQueryManager.isFilterEmpty(filter)}
        />
      </div>
    );
  }

  if (blockedDoiMatchedSearch) {
    return (
      <NoSsr>
        <div className={styles.innerContainer}>
          <DoiSearchBlocked isLoading={articleSearchState.isContentLoading} searchDoi={articleSearchState.doi || ''} />
        </div>
      </NoSsr>
    );
  }

  if (queryParams) {
    const shouldAddMargin = articleSearchState.page > 1 && !hasNoMatchedAuthors;
    return (
      <div className={styles.innerContainer}>
        <div className={styles.searchSummary} style={shouldAddMargin ? { marginTop: '32px' } : {}}>
          <PaperSearchResultInfo
            searchFromSuggestion={articleSearchState.searchFromSuggestion}
            suggestionKeyword={articleSearchState.suggestionKeyword}
            query={articleSearchState.searchInput}
            docCount={articleSearchState.totalElements}
            shouldShowTitle={!hasNoMatchedAuthors}
            matchingPhrases={articleSearchState.detectedPhrases}
          />
          <CreateAlertButton searchInput={articleSearchState.searchInput} />
        </div>
        <FilterBox query={queryParams.query} />
        <SearchList
          currentUser={currentUserState}
          papers={articleSearchState.searchItemsToShow}
          isLoading={articleSearchState.isContentLoading}
          searchQueryText={articleSearchState.suggestionKeyword || queryParams.query || ''}
        />
        <Pagination
          page={articleSearchState.page}
          totalPages={articleSearchState.totalPages}
          currentUserDevice={layout.userDevice}
          location={location}
        />
        <CreateKeywordAlertDialog />
      </div>
    );
  }
  return null;
};

const SearchContainer: React.FC<Props> = props => {
  const {
    articleSearchState,
    currentUserState,
    location,
    searchPapers,
    changeSearchQuery,
    enableAutoYearFilter,
  } = props;

  const [queryParams, setQueryParams] = React.useState<SearchPageQueryParams>(
    parse(location.search, { ignoreQueryPrefix: true })
  );
  const [filter, setFilter] = React.useState(SearchQueryManager.objectifyPaperFilter(queryParams.filter));
  const cancelToken = React.useRef(axios.CancelToken.source());

  React.useEffect(() => {
    if (currentUserState.isLoggingIn) return;

    const currentQueryParams = parse(location.search, {
      ignoreQueryPrefix: true,
    });

    changeSearchQuery({
      query: SafeURIDecoder.decode(currentQueryParams.query || ''),
    });
    setQueryParams(currentQueryParams);
    setFilter(SearchQueryManager.objectifyPaperFilter(currentQueryParams.filter));

    // set params
    const params = SearchQueryManager.makeSearchQueryFromParamsObject(currentQueryParams);
    params.cancelToken = cancelToken.current.token;
    params.detectYear = articleSearchState.searchInput !== currentQueryParams.query || enableAutoYearFilter;

    // HACK: any
    (searchPapers(params) as any).then(() => {
      restoreScroll(location.key);
    });

    return () => {
      cancelToken.current.cancel();
      cancelToken.current = axios.CancelToken.source();
    };
  }, [location.key, location.search, currentUserState.isLoggedIn, currentUserState.isLoggingIn, searchPapers]);

  if (articleSearchState.pageErrorCode) {
    return <ErrorPage />;
  }

  const shouldShowEmailBanner = !currentUserState.isLoggedIn && !articleSearchState.isContentLoading;

  return (
    <div className={styles.rootWrapper}>
      <SearchHelmet query={queryParams.query || ''} />
      <TabNavigationBar searchKeyword={articleSearchState.searchInput} />
      <div className={styles.articleSearchContainer}>
        <div className={styles.leftBoxWrapper}>
          <AuthorSearchResult
            isLoading={articleSearchState.isContentLoading}
            matchAuthors={articleSearchState.matchAuthors}
            queryParams={queryParams}
            shouldShow={articleSearchState.page === 1 && SearchQueryManager.isFilterEmpty(filter)}
          />
          <SearchResult {...props} queryParams={queryParams} filter={filter} />
        </div>
        <div
          className={classNames({
            [styles.noAuthorRightBoxWrapper]: true,
            [styles.rightBoxWrapper]:
              articleSearchState.matchAuthors && articleSearchState.matchAuthors.totalElements > 0,
          })}
        >
          {shouldShowEmailBanner && (
            <div className={styles.rightItemWrapper}>
              <EmailBanner />
            </div>
          )}
        </div>
      </div>
      <Footer
        containerStyle={{
          position: 'absolute',
          bottom: 0,
          backgroundColor: 'white',
          width: '100%',
        }}
      />
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    layout: state.layout,
    articleSearchState: state.articleSearch,
    currentUserState: state.currentUser,
    configuration: state.configuration,
    enableAutoYearFilter: state.searchFilterState.enableAutoYearFilter,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) =>
  bindActionCreators(
    {
      searchPapers,
      changeSearchQuery,
    },
    dispatch
  );

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withStyles<typeof SearchContainer>(styles)(SearchContainer))
);
