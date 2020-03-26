import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { AppState } from '@src/store/rootReducer';
import PapersQueryFormatter from '../../helpers/searchQueryManager';
import { withStyles } from '../../helpers/withStyles';
import getQueryParamsObject from '../../helpers/getQueryParamsObject';
import restoreScroll from '../../helpers/restoreScroll';
import ArticleSpinner from '../../components/spinner/articleSpinner';
import { CurrentUser } from '../../model/currentUser';
import { Configuration } from '../../reducers/configuration';
import { Helmet } from 'react-helmet';
import AuthorSearchLongItem from '../../components/authorSearchLongItem';
import MobilePagination from '../../components/mobilePagination';
import DesktopPagination from '../../components/desktopPagination';
import NoResultInSearch from '../../components/noResultInSearch';
import TabNavigationBar from '../../components/tabNavigationBar';
import { getUrlDecodedQueryParamsObject } from '../../helpers/makeNewFilterLink';
import EnvChecker from '../../helpers/envChecker';
import ActionTicketManager from '../../helpers/actionTicketManager';
import { Author } from '../../model/author/author';
import Footer from '../../components/footer';
import { LayoutState, UserDevice } from '@src/reducers/layout';
import { ArticleSearchState } from '@src/reducers/articleSearch';
import { AuthorSearchState } from '@src/reducers/authorSearch';
import { fetchSearchAuthors } from '@src/actions/search';
import SearchQueryManager from '@src/helpers/searchQueryManager';
import { AppDispatch } from '@src/store';
const styles = require('./authorSearch.scss');

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    articleSearch: state.articleSearch,
    authorSearch: state.authorSearch,
    currentUser: state.currentUser,
    configuration: state.configuration,
  };
}

export interface AuthorSearchProps extends RouteComponentProps<null> {
  layout: LayoutState;
  currentUser: CurrentUser;
  articleSearch: ArticleSearchState;
  authorSearch: AuthorSearchState;
  configuration: Configuration;
  dispatch: AppDispatch;
}

@withStyles<typeof AuthorSearch>(styles)
class AuthorSearch extends React.PureComponent<AuthorSearchProps> {
  public async componentDidMount() {
    const { dispatch, location } = this.props;
    const searchQueryObject = SearchQueryManager.makeSearchQueryFromParamsObject(getQueryParamsObject(location.search));
    const authors = await dispatch(fetchSearchAuthors(searchQueryObject));
    // TODO: change logging logic much easier after changing the class component to React hooks.
    this.logSearchResult(authors);
    restoreScroll(location.key);
  }

  public async componentDidUpdate(prevProps: AuthorSearchProps) {
    const { dispatch, location } = this.props;
    const beforeSearch = prevProps.location.search;
    const afterSearch = location.search;

    if (!!afterSearch && beforeSearch !== afterSearch) {
      const searchQueryObject = SearchQueryManager.makeSearchQueryFromParamsObject(
        getQueryParamsObject(location.search)
      );
      const authors = await dispatch(fetchSearchAuthors(searchQueryObject));
      this.logSearchResult(authors);
      restoreScroll(this.props.location.key);
    }
  }

  public render() {
    const { authorSearch, location } = this.props;
    const { isLoading } = authorSearch;
    const queryParams = getUrlDecodedQueryParamsObject(location);

    const hasNoAuthorSearchResult = !authorSearch.searchItemsToShow || authorSearch.searchItemsToShow.length === 0;

    if (authorSearch.pageErrorCode) {
      return <Redirect to={`/${authorSearch.pageErrorCode}`} />;
    }

    if (hasNoAuthorSearchResult && queryParams) {
      return isLoading ? (
        this.renderLoadingSpinner()
      ) : (
        <>
          <TabNavigationBar searchKeyword={authorSearch.searchInput} />
          <NoResultInSearch
            searchText={queryParams.query}
            otherCategoryCount={authorSearch.totalElements}
            type="author"
          />
        </>
      );
    } else if (queryParams) {
      return (
        <div className={styles.rootWrapper}>
          <TabNavigationBar searchKeyword={authorSearch.searchInput} />
          <div className={styles.articleSearchContainer}>
            {this.getResultHelmet(queryParams.query)}
            <div className={styles.innerContainer}>
              {isLoading ? this.renderLoadingSpinner() : this.getAuthorEntitiesSection()}
              {this.getPaginationComponent()}
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
    } else {
      // TODO: Make an error alerting page
      return null;
    }
  }

  private logSearchResult = (searchResult?: Author[] | null) => {
    if (!EnvChecker.isOnServer()) {
      // TODO: replace almost same logic with ArticleSearch container's same method
      if (!searchResult || searchResult.length === 0) {
        ActionTicketManager.trackTicket({
          pageType: 'authorSearchResult',
          actionType: 'view',
          actionArea: 'authorList',
          actionTag: 'pageView',
          actionLabel: String(0),
        });
      } else {
        ActionTicketManager.trackTicket({
          pageType: 'authorSearchResult',
          actionType: 'view',
          actionArea: 'authorList',
          actionTag: 'pageView',
          actionLabel: String(searchResult.length),
        });
      }
    }
  };

  private getAuthorEntitiesSection = () => {
    const { authorSearch } = this.props;
    const authorEntities = authorSearch.searchItemsToShow;

    if (authorEntities && authorEntities.length > 0) {
      const matchAuthorCount = authorSearch.totalElements;
      const authorItems = authorEntities.map(matchEntity => {
        return <AuthorSearchLongItem authorEntity={matchEntity} key={matchEntity.id} />;
      });
      return (
        <div>
          <div className={styles.authorItemsHeader}>
            <span className={styles.categoryHeader}>Author</span>
            <span className={styles.categoryCount}>{matchAuthorCount}</span>
          </div>
          <div className={styles.authorItemsWrapper}>{authorItems}</div>
        </div>
      );
    }

    return null;
  };
  private getPaginationComponent = () => {
    const { authorSearch, layout } = this.props;
    const { page, totalPages } = authorSearch;

    const currentPageIndex: number = page - 1;

    if (layout.userDevice !== UserDevice.DESKTOP) {
      return (
        <MobilePagination
          totalPageCount={totalPages}
          currentPageIndex={currentPageIndex}
          getLinkDestination={this.makePaginationLink}
          wrapperStyle={{
            margin: '12px 0',
          }}
        />
      );
    } else {
      return (
        <DesktopPagination
          type="author_search_result"
          totalPage={totalPages}
          currentPageIndex={currentPageIndex}
          getLinkDestination={this.makePaginationLink}
          wrapperStyle={{
            margin: '24px 0',
          }}
          actionArea="authorList"
        />
      );
    }
  };

  private makePaginationLink = (page: number) => {
    const { location } = this.props;
    const queryParamsObject = getUrlDecodedQueryParamsObject(location);
    const queryParams = PapersQueryFormatter.stringifyPapersQuery({
      ...queryParamsObject,
      page,
    });

    return `/search/authors?${queryParams}`;
  };

  private renderLoadingSpinner = () => {
    return (
      <div className={styles.loadingContainer}>
        <ArticleSpinner className={styles.loadingSpinner} />
      </div>
    );
  };

  private getResultHelmet = (query: string) => {
    return (
      <Helmet>
        <title>{`${query} | Search | Scinapse`}</title>
      </Helmet>
    );
  };
}
export default connect(mapStateToProps)(withRouter(AuthorSearch));
