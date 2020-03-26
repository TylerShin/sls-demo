import React from 'react';
import axios from 'axios';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { RouteComponentProps, Link, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import parse from 'date-fns/parse';
import { Button } from '@pluto_network/pluto-design-elements';
import { AppState } from '@src/store/rootReducer';
import { withStyles } from '@src/helpers/withStyles';
import { getCollections } from './sideEffect';
import { Collection, collectionSchema } from '@src/model/collection';
import { Member, memberSchema } from '@src/model/member';
import Icon from '@src/components/icons';
import { trackEvent } from '@src/helpers/handleGA';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import { deleteCollection } from '@src/actions/globalDialog';
import { CurrentUser } from '@src/model/currentUser';
import restoreScroll from '@src/helpers/restoreScroll';
import alertToast from '@src/helpers/makePlutoToastAction';
import Footer from '@src/components/footer';
import { UserCollectionsState } from '@src/reducers/userCollections';
const styles = require('./collections.scss');

export interface UserCollectionsProps extends RouteComponentProps<{ userId: string }> {
  dispatch: Dispatch<any>;
  userCollections: UserCollectionsState;
  collections: Collection[] | undefined;
  member: Member | undefined;
  currentUser: CurrentUser;
}

function mapStateToProps(state: AppState) {
  return {
    userCollections: state.userCollections,
    collections: denormalize(state.userCollections.collectionIds, [collectionSchema], state.entities).filter(
      (c: Collection) => !!c
    ),
    member: denormalize(state.userCollections.targetMemberId, memberSchema, state.entities),
    currentUser: state.currentUser,
  };
}

@withStyles<typeof UserCollections>(styles)
class UserCollections extends React.PureComponent<UserCollectionsProps> {
  private cancelToken = axios.CancelToken.source();

  public async componentDidMount() {
    const { location } = this.props;
    await this.fetchCollections();
    restoreScroll(location.key);
  }

  public async componentDidUpdate(prevProps: UserCollectionsProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      const userId = this.props.match.params.userId;
      await this.fetchCollections(userId);
      restoreScroll(this.props.location.key);
    }
  }

  public componentWillUnmount() {
    this.cancelToken.cancel();
  }

  public render() {
    const { userCollections, member, collections } = this.props;

    if (userCollections.pageErrorCode) {
      return <Redirect to={`/${userCollections.pageErrorCode}`} />;
    }

    if (member && collections) {
      return (
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            {this.getPageHelmet()}
            <div className={styles.container}>
              <div className={styles.header}>
                <div className={styles.leftBox}>
                  <div className={styles.titleBox}>
                    <span>{`${member.firstName} ${member.lastName || ''}'s collections`}</span>
                    <span className={styles.collectionCount}>{userCollections.collectionIds.length}</span>
                  </div>
                </div>
                <div className={styles.rightBox}>{this.getNewCollectionBtn()}</div>
              </div>
              {this.getCollections(collections)}
            </div>
          </div>
          <Footer containerStyle={{ backgroundColor: 'white' }} />
        </div>
      );
    } else {
      return null;
    }
  }

  private getCollections = (collections: Collection[]) => {
    if (collections && collections.length > 0) {
      const collectionNodes = collections.map(collection => {
        const parsedUpdatedAt = parse(collection.updatedAt);

        return (
          <li className={styles.collectionItem} key={`collection_item_${collection.id}`}>
            <div className={styles.titleBox}>
              <Link to={`/collections/${collection.id}`} className={styles.title}>
                {collection.title}
              </Link>
              {this.getCollectionControlBtns(collection)}
            </div>
            <div className={styles.description}>{collection.description}</div>
            <div className={styles.subInformation}>
              <span>
                <b>{`${collection.paperCount} papers · `}</b>
              </span>
              <span>{`Last updated `}</span>
              <span>
                <b>{`${distanceInWordsToNow(parsedUpdatedAt)} ago`}</b>
              </span>
            </div>
          </li>
        );
      });

      return <ul className={styles.collectionListWrapper}>{collectionNodes}</ul>;
    }
    return null;
  };

  private getCollectionControlBtns = (collection: Collection) => {
    const { currentUser, match } = this.props;
    const collectionUserId = parseInt(match.params.userId, 10);

    if (currentUser && currentUser.id === collectionUserId) {
      return (
        <div className={styles.collectionControlBox}>
          <div className={styles.controlIconWrapper}>
            <Button
              elementType="button"
              aria-label="Edit collection button"
              size="small"
              color="black"
              onClick={() => {
                this.handleClickEditCollection(collection);
              }}
            >
              <Icon icon="PEN" />
            </Button>
          </div>
          <div className={styles.controlIconWrapper}>
            <Button
              elementType="button"
              aria-label="Delete collection button"
              size="small"
              color="black"
              onClick={() => {
                this.handleDeleteCollection(collection);
              }}
            >
              <Icon icon="TRASH_CAN" />
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  private getNewCollectionBtn = () => {
    const { currentUser, match } = this.props;
    const collectionUserId = parseInt(match.params.userId, 10);
    if (currentUser && currentUser.id === collectionUserId) {
      return (
        <Button
          elementType="button"
          aria-label="Create new collection button"
          size="small"
          variant="outlined"
          color="gray"
          onClick={this.handleClickNewCollectionButton}
        >
          <Icon icon="PLUS" />
          <span>Create New Collection</span>
        </Button>
      );
    }
    return null;
  };

  private handleDeleteCollection = async (collection: Collection) => {
    const { dispatch } = this.props;

    if (confirm(`Do you really want to DELETE collection ${collection.title}?`)) {
      try {
        await dispatch(deleteCollection(collection.id));
      } catch (err) {
        alertToast({
          type: 'error',
          message: err.message,
        });
      }
    }
  };

  private handleClickEditCollection = (collection: Collection) => {
    GlobalDialogManager.openEditCollectionDialog(collection);
    trackEvent({
      category: 'Additional Action',
      action: 'Click [Edit Collection] Button',
      label: 'my collection list page',
    });
  };

  private handleClickNewCollectionButton = () => {
    GlobalDialogManager.openNewCollectionDialog();
    trackEvent({
      category: 'Additional Action',
      action: 'Click [New Collection] Button',
      label: 'my collection list page',
    });
  };

  private fetchCollections = (userId?: string) => {
    const { dispatch, match, location } = this.props;

    getCollections({
      dispatch,
      match,
      pathname: location.pathname,
      userId,
    });
  };

  private getPageHelmet = () => {
    const { collections, member } = this.props;

    if (collections && member) {
      return (
        <Helmet>
          <title>{`${member.firstName} ${member.lastName || ''}'s collections | Scinapse`}</title>
          <link rel="canonical" href={`https://scinapse.io/collections/users/${member.id}/collections`} />
          <meta itemProp="name" content={`${member.firstName} ${member.lastName || ''}'s collections | Scinapse`} />
          <meta
            name="description"
            content={`Collection list created by ${member.firstName} ${member.lastName || ''} in Scinapse`}
          />
          <meta
            name="twitter:title"
            content={`${member.firstName} ${member.lastName || ''}'s collections | Scinapse`}
          />
          <meta
            name="twitter:description"
            content={`Collection list created by ${member.firstName} ${member.lastName || ''} in Scinapse`}
          />
          <meta name="twitter:card" content={`${member.firstName} ${member.lastName || ''}'s collections | Scinapse`} />
          <meta property="og:title" content={`${member.firstName} ${member.lastName || ''}'s collections | Scinapse`} />
          <meta
            property="og:description"
            content={`Collection list created by ${member.firstName} ${member.lastName || ''} in Scinapse`}
          />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://scinapse.io/collections/users/${member.id}/collections`} />
        </Helmet>
      );
    }
  };
}

export default connect(mapStateToProps)(UserCollections);
