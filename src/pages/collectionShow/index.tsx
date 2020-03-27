import React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Link, Redirect } from 'react-router-dom';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import parse from 'date-fns/parse';
import { denormalize } from 'normalizr';
import { AppState } from '@src/store/rootReducer';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import { Collection, collectionSchema } from '@src/model/collection';
import { fetchCollectionShowData } from './sideEffect';
import { paperInCollectionSchema } from '@src/model/paperInCollection';
import Icon from '@src/components/icons';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import SortBox from '@src/components/sortBox';
import { getPapers } from '@src/actions/collections';
import restoreScroll from '@src/helpers/restoreScroll';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { CollectionShowMatchParams } from './types';
import CollectionSideNaviBar from './components/collectionSideNaviBar';
import { getCollections } from '@src/actions/collections';
import RelatedPaperInCollectionShow from './components/relatedPaperInCollectionShow';
import Footer from '@src/components/footer';
import { withStyles } from '@src/helpers/withStyles';
import PageHelmet from '@src/components/helmet/collectionShow';
import CollectionShareButton from './components/collectionShareButton';
import CollectionPaperList from './components/collectionPaperList';
import { ACTION_TYPES } from '@src/actions/actionTypes';
import Pagination from './components/pagination';
import { Button, InputField } from '@pluto_network/pluto-design-elements';
import { AppDispatch } from '@src/store';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { checkAuthStatus } from '@src/actions/auth';
import { removePaperFromCollection } from '@src/actions/globalDialog';
const styles = require('./collectionShow.scss');

type Props = ReturnType<typeof mapStateToProps> &
  RouteComponentProps<CollectionShowMatchParams> & {
    dispatch: AppDispatch;
  };

const EditButton: React.FC<{ inOwnCollection: boolean; userCollection: Collection }> = ({
  inOwnCollection,
  userCollection,
}) => {
  if (!inOwnCollection) return null;

  return (
    <Button
      elementType="button"
      aria-label="Edit collection button"
      size="small"
      variant="text"
      color="gray"
      onClick={() => GlobalDialogManager.openEditCollectionDialog(userCollection!)}
      style={{ marginLeft: '8px' }}
    >
      <Icon icon="PEN" />
      <span>Edit</span>
    </Button>
  );
};

const CollectionShow: React.FC<Props> = props => {
  const {
    collectionShow,
    dispatch,
    match,
    location,
    configuration,
    currentUser,
    userCollection,
    papersInCollection,
    layout,
  } = props;
  const [inOwnCollection, setInOwnCollection] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState<string>('');
  const cancelTokenSource = React.useRef<CancelTokenSource>(axios.CancelToken.source());

  React.useEffect(() => {
    const itsNotMine =
      !currentUser.isLoggedIn ||
      (currentUser.isLoggedIn && userCollection && userCollection.createdBy.id !== currentUser.id);

    setInOwnCollection(!itsNotMine);

    if (itsNotMine && userCollection) {
      dispatch(getCollections(userCollection.createdBy.id, cancelTokenSource.current.token, false));
    }

    const notRenderedAtServerOrJSAlreadyInitialized =
      !configuration.succeedAPIFetchAtServer || configuration.renderedAtClient;

    if (notRenderedAtServerOrJSAlreadyInitialized) {
      dispatch({ type: ACTION_TYPES.COLLECTION_SHOW_CLEAR_SELECT_PAPER_ITEM });
      fetchCollectionShowData({
        dispatch,
        match,
        pathname: location.pathname,
      });
      restoreScroll(location.key);
    }

    return () => {
      cancelTokenSource.current.cancel();
      cancelTokenSource.current = axios.CancelToken.source();
    };
  }, [match.params.collectionId, currentUser.isLoggedIn]);

  const handleSubmitSearch = React.useCallback(
    (query: string) => {
      dispatch(
        getPapers({
          collectionId: collectionShow.mainCollectionId,
          page: 1,
          sort: collectionShow.sortType,
          cancelToken: cancelTokenSource.current.token,
          query,
        })
      );

      ActionTicketManager.trackTicket({
        pageType: 'collectionShow',
        actionType: 'fire',
        actionArea: 'paperList',
        actionTag: 'query',
        actionLabel: query,
      });

      return () => {
        cancelTokenSource.current.cancel();
        cancelTokenSource.current = axios.CancelToken.source();
      };
    },
    [dispatch, collectionShow.mainCollectionId, collectionShow.sortType]
  );

  const handleClickSort = React.useCallback(
    (option: PAPER_LIST_SORT_OPTIONS) => {
      dispatch(
        getPapers({
          collectionId: collectionShow.mainCollectionId,
          page: collectionShow.currentPaperListPage,
          sort: option,
          cancelToken: cancelTokenSource.current.token,
          query: collectionShow.searchKeyword,
        })
      );

      return () => {
        cancelTokenSource.current.cancel();
        cancelTokenSource.current = axios.CancelToken.source();
      };
    },
    [dispatch, collectionShow.mainCollectionId, collectionShow.currentPaperListPage, collectionShow.searchKeyword]
  );

  const handleSelectedPaperItem = React.useCallback(
    (paperId: string) => {
      dispatch({
        type: ACTION_TYPES.COLLECTION_SHOW_SELECT_PAPER_ITEM,
        payload: { paperId: paperId },
      });
    },
    [dispatch]
  );

  const handleRemovePaperFromCollection = React.useCallback(
    async (paperIds: string | string[]) => {
      const auth = await dispatch(checkAuthStatus());
      const isLoggedIn = auth && auth.loggedIn;

      if (!isLoggedIn) return window.alert('Your login status has changed. Please refresh the page and try again.');

      let param;
      if (typeof paperIds === 'object') {
        param = paperIds;
      } else {
        param = [paperIds];
      }

      let removeConfirm;

      if (param.length >= 2) {
        removeConfirm = confirm(`Are you sure to remove ${param.length} paper from '${userCollection.title}'?`);
      } else {
        removeConfirm = confirm(`Are you sure to remove this paper from '${userCollection.title}'?`);
      }

      if (userCollection && removeConfirm) {
        try {
          await dispatch(removePaperFromCollection({ paperIds: param, collection: userCollection }));
        } catch (err) {}
      }
    },
    [dispatch, userCollection]
  );

  if (collectionShow.pageErrorCode) {
    return <Redirect to={`/${collectionShow.pageErrorCode}`} />;
  }

  if (collectionShow.isLoadingCollection) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <ArticleSpinner className={styles.loadingSpinner} />
        </div>
      </div>
    );
  } else if (userCollection) {
    const parsedUpdatedAt = parse(userCollection.updatedAt);

    return (
      <div>
        <div className={styles.collectionShowWrapper}>
          <div className={styles.collectionShowContentsWrapper}>
            <PageHelmet userCollection={userCollection} />
            <div className={styles.headSection}>
              <div className={styles.container}>
                <div className={styles.leftBox}>
                  <div className={styles.categoryName}>COLLECTION</div>
                  <div className={styles.title}>
                    <span>{userCollection.title}</span>
                    <EditButton inOwnCollection={inOwnCollection} userCollection={userCollection} />
                  </div>
                  <div className={styles.description}>{userCollection.description}</div>
                  <div className={styles.infoWrapper}>
                    <span>Created by </span>
                    <Link
                      className={styles.collectionCreatedUser}
                      to={`/users/${userCollection.createdBy.id}/collections`}
                    >
                      <strong>{`${userCollection.createdBy.firstName} ${userCollection.createdBy.lastName ||
                        ''}`}</strong>
                    </Link>
                    <span>{` · Last updated `}</span>
                    <strong>{`${distanceInWordsToNow(parsedUpdatedAt)} `}</strong>
                    <span>ago</span>
                  </div>
                </div>
                <div className={styles.rightBox}>
                  <CollectionShareButton userCollection={userCollection} />
                </div>
              </div>
            </div>

            <div className={styles.paperListContainer}>
              <CollectionSideNaviBar
                currentCollectionId={collectionShow.mainCollectionId}
                collectionCreateBy={userCollection.createdBy}
              />
              <div className={styles.leftBox}>
                <div className={styles.paperListBox}>
                  <div className={styles.header}>
                    <div className={styles.searchContainer}>
                      <div className={styles.searchInputWrapper}>
                        <InputField
                          aria-label="Scinapse search box in paper show"
                          trailingIcon={<Icon icon="SEARCH" onClick={() => handleSubmitSearch(searchInput)} />}
                          placeholder="Search papers in this collection"
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              handleSubmitSearch(e.currentTarget.value);
                            }
                          }}
                          onChange={e => setSearchInput(e.currentTarget.value)}
                          value={searchInput}
                        />
                      </div>
                      <div className={styles.sortBoxWrapper}>
                        <SortBox
                          sortOption={collectionShow.sortType}
                          onClickOption={handleClickSort}
                          currentPage="collectionShow"
                          exposeRecentlyUpdated={true}
                          exposeRelevanceOption={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <CollectionPaperList
                      inOwnCollection={inOwnCollection}
                      papersInCollection={papersInCollection}
                      currentUser={currentUser}
                      collectionShow={collectionShow}
                      userCollection={userCollection}
                      onSelectedPaperInCollection={handleSelectedPaperItem}
                      onRemovePaperFromCollection={handleRemovePaperFromCollection}
                    />
                  </div>
                  <div>
                    <Pagination collectionShow={collectionShow} layout={layout} />
                  </div>
                </div>
                <RelatedPaperInCollectionShow collectionId={userCollection.id} />
              </div>
            </div>
          </div>
        </div>
        <Footer containerStyle={{ backgroundColor: '#f8f9fb' }} />
      </div>
    );
  } else {
    return null;
  }
};

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    currentUser: state.currentUser,
    collectionShow: state.collectionShow,
    configuration: state.configuration,
    userCollection: denormalize(state.collectionShow.mainCollectionId, collectionSchema, state.entities) as Collection,
    papersInCollection: denormalize(state.collectionShow.paperIds, [paperInCollectionSchema], state.entities),
  };
}

export default connect(mapStateToProps)(withRouter(withStyles<typeof CollectionShow>(styles)(CollectionShow)));
