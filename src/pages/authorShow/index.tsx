import React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { denormalize } from 'normalizr';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import DesktopPagination from '@src/components/desktopPagination';
import MobilePagination from '@src/components/mobilePagination';
import { withStyles } from '@src/helpers/withStyles';
import { AuthorShowState as AuthorShowGlobalState } from '@src/reducers/authorSHow';
import { Configuration } from '@src/reducers/configuration';
import { Author, authorSchema } from '@src/model/author/author';
import FullPaperItem from '@src/components/paperItem/fullPaperItem';
import { getAuthorPapers } from '@src/actions/author';
import { DEFAULT_AUTHOR_PAPERS_SIZE } from '@src/api/author';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import CoAuthor from './components/coAuthor';
import { InputField } from '@pluto_network/pluto-design-elements';
import { LayoutState, UserDevice } from '@src/reducers/layout';
import AuthorShowHeader from './components/authorShowHeader';
import { AppState } from '@src/store/rootReducer';
import { fetchAuthorPapers } from '@src/actions/author';
import Footer from '@src/components/footer';
import Icon from '@src/components/icons';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { fetchAuthorShowPageData } from './sideEffect';
import restoreScroll from '@src/helpers/restoreScroll';
import { CurrentUser } from '@src/model/currentUser';
import { AppDispatch } from '@src/store';
import SortBox from '@src/components/sortBox';
import { AUTHOR_PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
const styles = require('./authorShow.scss');

export interface AuthorShowProps extends RouteComponentProps<{ authorId: string }> {
  layout: LayoutState;
  author: Author;
  coAuthors: Author[];
  paperIds: string[];
  authorShow: AuthorShowGlobalState;
  configuration: Configuration;
  currentUser: CurrentUser;
  dispatch: AppDispatch;
}

interface AuthorShowLocalState {
  currentQuery: string;
}

@withStyles<typeof AuthorShow>(styles)
class AuthorShow extends React.PureComponent<AuthorShowProps, AuthorShowLocalState> {
  public async componentDidMount() {
    const { dispatch, location, match, configuration } = this.props;
    const notRenderedAtServerOrJSAlreadyInitialized =
      !configuration.succeedAPIFetchAtServer || configuration.renderedAtClient;

    if (notRenderedAtServerOrJSAlreadyInitialized) {
      await fetchAuthorShowPageData({
        dispatch,
        match,
        pathname: location.pathname,
      });
      restoreScroll(location.key);
    }
  }

  public constructor(props: AuthorShowProps) {
    super(props);

    this.state = {
      currentQuery: '',
    };
  }

  public async componentDidUpdate(prevProps: AuthorShowProps) {
    const { match, dispatch, location } = this.props;

    if (this.props.match.params.authorId !== prevProps.match.params.authorId) {
      await fetchAuthorShowPageData({
        dispatch,
        match,
        pathname: location.pathname,
      });
      restoreScroll(location.key);
    }
  }
  public render() {
    const { author, authorShow, layout, currentUser } = this.props;
    const { currentQuery } = this.state;

    if (authorShow.pageErrorStatusCode) {
      return <Redirect to={`/${authorShow.pageErrorStatusCode}`} />;
    }

    if (!author) {
      return null;
    }

    if (authorShow.isLoadingPage) {
      return (
        <div className={styles.paperShowWrapper}>
          <ArticleSpinner style={{ margin: '200px auto' }} />
        </div>
      );
    }

    return (
      <div className={styles.authorShowPageWrapper}>
        {this.getPageHelmet()}
        <div className={styles.rootWrapper}>
          <AuthorShowHeader
            currentUser={currentUser}
            userDevice={layout.userDevice}
            author={author}
            navigationContent={null}
          />
          <div className={styles.contentBox}>
            <div className={styles.container}>
              <div className={styles.contentFlexWrapper}>
                <div className={styles.contentLeftBox}>
                  <div className={styles.paperListBox}>
                    <div className={styles.paperListHeader}>
                      <div className={styles.paperListLeft}>
                        <span className={styles.paperListTitle}>Publications</span>
                        <span className={styles.paperListTitleNumber}>{` ${authorShow.papersTotalCount}`}</span>
                      </div>
                    </div>
                    <div className={styles.paperSearchContainer}>
                      <div className={styles.searchInputWrapper}>
                        <InputField
                          aria-label="Scinapse search box in author show"
                          defaultValue={authorShow.paperSearchQuery}
                          trailingIcon={
                            <Icon
                              icon="SEARCH"
                              onClick={() => {
                                this.handleSubmitSearch(currentQuery);
                              }}
                            />
                          }
                          placeholder="Search papers"
                          onChange={e => {
                            this.setState({ currentQuery: e.currentTarget.value });
                          }}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              this.handleSubmitSearch(e.currentTarget.value);
                            }
                          }}
                        />
                      </div>

                      <SortBox
                        sortOption={authorShow.papersSort}
                        onClickOption={this.handleClickSortOption}
                        currentPage="authorShow"
                      />
                    </div>

                    <div className={styles.paperListContent}>{this.getPaperList()}</div>
                    {this.getPagination()}
                  </div>
                </div>

                <div className={styles.contentRightBox}>
                  <div className={styles.coAuthorTitleBox}>
                    <span className={styles.coAuthorListTitle}>Close Researchers</span>
                  </div>
                  <div className={styles.coAuthorList}>{this.getCoAuthors()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer containerStyle={{ backgroundColor: '#f8f9fb' }} />
      </div>
    );
  }

  private getPagination = () => {
    const { authorShow, layout } = this.props;

    if (layout.userDevice !== UserDevice.DESKTOP) {
      return (
        <MobilePagination
          totalPageCount={authorShow.papersTotalPage}
          currentPageIndex={authorShow.papersCurrentPage - 1}
          onItemClick={this.handleClickPagination}
          wrapperStyle={{
            margin: '24px 0 40px 0',
          }}
        />
      );
    } else {
      return (
        <DesktopPagination
          type="AUTHOR_SHOW_PAPERS_PAGINATION"
          totalPage={authorShow.papersTotalPage}
          currentPageIndex={authorShow.papersCurrentPage - 1}
          onItemClick={this.handleClickPagination}
          wrapperStyle={{
            margin: '24px 0 40px 0',
          }}
        />
      );
    }
  };

  private handleClickPagination = (page: number) => {
    const { dispatch, authorShow, author } = this.props;

    dispatch(
      fetchAuthorPapers({
        authorId: author.id,
        sort: authorShow.papersSort,
        page,
      })
    );
  };

  private makeStructuredData = () => {
    const { author, coAuthors } = this.props;

    const affiliationName = author.lastKnownAffiliation ? author.lastKnownAffiliation.name : '';
    const colleagues = coAuthors.map(coAuthor => {
      if (!coAuthor) {
        return null;
      }
      const coAuthorAffiliation = coAuthor.lastKnownAffiliation ? coAuthor.lastKnownAffiliation.name : '';
      return {
        '@context': 'http://schema.org',
        '@type': 'Person',
        name: coAuthor.name,
        affiliation: {
          '@type': 'Organization',
          name: coAuthorAffiliation,
        },
        description: `${coAuthorAffiliation ? `${coAuthorAffiliation} |` : ''} citation: ${
          coAuthor.citationCount
        } | h-index: ${coAuthor.hindex}`,
        mainEntityOfPage: 'https://scinapse.io',
      };
    });

    const structuredData: any = {
      '@context': 'http://schema.org',
      '@type': 'Person',
      name: author.name,
      affiliation: {
        '@type': 'Organization',
        name: affiliationName,
      },
      colleague: colleagues,
      description: `${affiliationName ? `${affiliationName} |` : ''} citation: ${author.citationCount} | h-index: ${
        author.hindex
      }`,
      mainEntityOfPage: 'https://scinapse.io',
    };

    return structuredData;
  };

  private getPageHelmet = () => {
    const { author } = this.props;
    const affiliationName = author.lastKnownAffiliation ? author.lastKnownAffiliation.name : '';
    const description = `${affiliationName ? `${affiliationName} |` : ''} citation: ${
      author.citationCount
    } | h-index: ${author.hindex}`;

    return (
      <Helmet>
        <title>{`${author.name} | Scinapse`}</title>
        <link rel="canonical" href={`https://scinapse.io/authors/${author.id}`} />
        <meta itemProp="name" content={`${author.name} | Scinapse`} />
        <meta name="description" content={description} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:card" content={`${author.name} | Scinapse`} />
        <meta name="twitter:title" content={`${author.name} | Scinapse`} />
        <meta property="og:title" content={`${author.name} | Scinapse`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://scinapse.io/authors/${author.id}`} />
        <meta property="og:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(this.makeStructuredData())}</script>
      </Helmet>
    );
  };

  private resetQuery = () => {
    const { dispatch, author } = this.props;

    if (author) {
      dispatch!(
        getAuthorPapers({
          authorId: author.id,
          page: 1,
          size: DEFAULT_AUTHOR_PAPERS_SIZE,
          query: '',
          sort: 'NEWEST_FIRST',
        })
      );
    }
  };

  private handleSubmitSearch = (query: string) => {
    const { dispatch, author, authorShow } = this.props;

    ActionTicketManager.trackTicket({
      pageType: 'authorShow',
      actionType: 'fire',
      actionArea: 'paperList',
      actionTag: 'query',
      actionLabel: query,
    });

    if (author) {
      dispatch!(
        getAuthorPapers({
          authorId: author.id,
          page: 1,
          size: DEFAULT_AUTHOR_PAPERS_SIZE,
          query,
          sort: authorShow.papersSort,
        })
      );
    }
  };

  private handleClickSortOption = (sortOption: AUTHOR_PAPER_LIST_SORT_OPTIONS) => {
    const { dispatch, author, authorShow } = this.props;

    if (author) {
      dispatch!(
        getAuthorPapers({
          authorId: author.id,
          page: 1,
          size: DEFAULT_AUTHOR_PAPERS_SIZE,
          query: authorShow.paperSearchQuery,
          sort: sortOption,
        })
      );
    }
  };

  private getCoAuthors = () => {
    const { coAuthors } = this.props;

    return coAuthors.map(author => {
      return <CoAuthor key={author.id} authorId={author.id} />;
    });
  };

  private getPaperList = () => {
    const { paperIds, authorShow } = this.props;

    if (authorShow.isLoadingPapers) {
      return (
        <div className={styles.loadingContainer}>
          <ArticleSpinner className={styles.loadingSpinner} />
        </div>
      );
    }

    if (
      !paperIds ||
      (paperIds.length === 0 && authorShow.papersTotalPage === 0 && authorShow.paperSearchQuery.length > 0)
    ) {
      return (
        <div className={styles.noPaperWrapper}>
          <Icon icon="UFO" className={styles.ufoIcon} />
          <div className={styles.noPaperDescription}>
            Your search <b>{authorShow.paperSearchQuery}</b> did not match any papers.
          </div>
          <button className={styles.reloadBtn} onClick={this.resetQuery}>
            <Icon icon="RELOAD" className={styles.reloadIcon} />
            Reload papers
          </button>
        </div>
      );
    }

    return paperIds.map(paperId => {
      if (paperId) {
        return <FullPaperItem key={paperId} paperId={paperId} pageType="authorShow" actionArea="paperList" />;
      }
    });
  };
}

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    authorShow: state.authorShow,
    author: denormalize(state.authorShow.authorId, authorSchema, state.entities),
    coAuthors: denormalize(state.authorShow.coAuthorIds, [authorSchema], state.entities),
    paperIds: state.authorShow.paperIds,
    configuration: state.configuration,
    currentUser: state.currentUser,
  };
}

export default connect(mapStateToProps)(withRouter(AuthorShow));
