import React from 'react';
import axios from 'axios';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button } from '@pluto_network/pluto-design-elements';
import addDays from 'date-fns/add_days';
import isAfter from 'date-fns/is_after';
import { parse } from 'qs';
import Store from 'store';
import BubblePopover from '../bubblePopover';
import { signOut } from '@src/actions/auth';
import { trackDialogView } from '../../helpers/handleGA';
import { withStyles } from '../../helpers/withStyles';
import ActionTicketManager from '../../helpers/actionTicketManager';
import GlobalDialogManager from '../../helpers/globalDialogManager';
import { ACTION_TYPES } from '../../actions/actionTypes';
import { CurrentUser } from '../../model/currentUser';
import SearchQueryManager from '../../helpers/searchQueryManager';
import { getCollections } from '@src/actions/collections';
import ResearchHistory from '../researchHistory';
import { changeSearchQuery } from '../../reducers/searchQuery';
import MobileSearchBox from '@src/components/mobileSearchBox';
import { ProfileRequestKey } from '../../constants/profileRequest';
import { AppState } from '@src/store/rootReducer';
import SearchInput from '../searchInput';
import Icon from '../icons';
import { HOME_PATH } from '@src/constants/route';
import { UserDevice, LayoutState } from '@src/reducers/layout';
import { Paper, paperSchema } from '@src/model/paper';
import { AppDispatch } from '@src/store';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
import { MyCollectionsState } from '@src/reducers/myCollections';
import { denormalize } from 'normalizr';
import { fetchKeywordAlertList } from '@src/actions/keyword';
const styles = require('./header.scss');

const HEADER_BACKGROUND_START_HEIGHT = 10;
const LAST_UPDATE_DATE = '2019-01-30T08:13:33.079Z';
const MAX_KEYWORD_SUGGESTION_LIST_COUNT = 10;
let ticking = false;

interface HeaderProps extends RouteComponentProps<any> {
  layoutState: LayoutState;
  currentUserState: CurrentUser;
  myCollectionsState: MyCollectionsState;
  paper: Paper | null;
  dispatch: AppDispatch;
}

interface HeaderStates {
  isTop: boolean;
  isUserDropdownOpen: boolean;
  userDropdownAnchorElement: HTMLElement | null;
}

function mapStateToProps(state: AppState) {
  return {
    currentUserState: state.currentUser,
    layoutState: state.layout,
    myCollectionsState: state.myCollections,
    paper: denormalize(state.paperShow.paperId, paperSchema, state.entities),
  };
}

const UserInformation: React.FunctionComponent<{ user: CurrentUser }> = props => {
  const { user } = props;

  return (
    <div className={styles.userInfoWrapper}>
      <div className={styles.username}>{`${user.firstName} ${user.lastName || ''}`}</div>
      <div className={styles.email}>{user.email}</div>
    </div>
  );
};

@withStyles<typeof ImprovedHeader>(styles)
class ImprovedHeader extends React.PureComponent<HeaderProps, HeaderStates> {
  private cancelToken = axios.CancelToken.source();
  private userDropdownAnchorRef: HTMLElement | null;

  public constructor(props: HeaderProps) {
    super(props);

    this.state = {
      isTop: true,
      isUserDropdownOpen: false,
      userDropdownAnchorElement: this.userDropdownAnchorRef,
    };
  }

  public componentDidMount() {
    window.addEventListener('scroll', this.handleScrollEvent, { passive: true });
    this.checkTopToast();
  }

  public componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollEvent);
  }

  public componentDidUpdate(prevProps: HeaderProps) {
    if (
      prevProps.currentUserState.isLoggedIn !== this.props.currentUserState.isLoggedIn &&
      this.props.currentUserState.isLoggedIn
    ) {
      const currentUser = this.props.currentUserState;
      this.cancelToken.cancel();
      this.cancelToken = axios.CancelToken.source();
      this.props.dispatch(getCollections(currentUser.id, this.cancelToken.token, true));
      this.props.dispatch(fetchKeywordAlertList());
    }
  }

  public render() {
    const navClassName = this.getNavbarClassName();

    return (
      <nav className={`${navClassName} mui-fixed`}>
        <MobileSearchBox />
        <div className={styles.headerContainer}>
          <div className={styles.leftBox}>
            {this.getHeaderLogo()}
            {this.getSearchFormContainer()}
          </div>
          {this.getHeaderButtons()}
        </div>
      </nav>
    );
  }

  private checkTopToast = () => {
    const old = new Date(LAST_UPDATE_DATE);
    const comparisonDate = addDays(old, 5);
    const now = new Date();
    const updateIsStaled = isAfter(now, comparisonDate);
    const alreadyOpenedTopToast = !!Cookies.get('alreadyOpenedTopToast');
    const shouldOpenToast = !updateIsStaled && !alreadyOpenedTopToast;

    if (shouldOpenToast) {
      this.setState(prevState => ({
        ...prevState,
        openTopToast: true,
      }));
    }
  };

  private handleCloseTopToast = () => {
    Cookies.set('alreadyOpenedTopToast', '1', { expires: 3 });
    this.setState(prevState => ({ ...prevState, openTopToast: false }));
  };

  private getNavbarClassName = () => {
    const { location } = this.props;

    if (location.pathname !== HOME_PATH) {
      if (this.state.isTop) {
        return styles.navbar;
      } else {
        return `${styles.navbar} ${styles.scrolledNavbar}`;
      }
    } else {
      if (this.state.isTop) {
        return `${styles.navbar} ${styles.searchHomeNavbar}`;
      } else {
        return `${styles.navbar} ${styles.scrolledNavbar} ${styles.searchHomeNavbar}`;
      }
    }
  };

  private handleScrollEvent = () => {
    if (!ticking) {
      requestAnimationFrame(this.updateIsTopState);
    }

    ticking = true;
  };

  private updateIsTopState = () => {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

    if (scrollTop < HEADER_BACKGROUND_START_HEIGHT) {
      this.setState({
        isTop: true,
      });
    } else {
      this.setState({
        isTop: false,
      });
    }

    ticking = false;
  };

  private getHeaderLogo = () => {
    const { location, layoutState, dispatch, currentUserState } = this.props;
    const isNotHome = location.pathname !== HOME_PATH;

    if (layoutState.userDevice !== UserDevice.DESKTOP && isNotHome) {
      return (
        <Link
          to="/"
          onClick={() => {
            dispatch(changeSearchQuery({ query: '' }));
          }}
          className={styles.headerLogoMark}
          aria-label="Scinapse small header logo"
        >
          <Icon icon="SCINAPSE_LOGO_SMALL" />
        </Link>
      );
    }

    if (!!currentUserState.ipInstitute) {
      return (
        <Link
          to="/"
          onClick={() => {
            dispatch(changeSearchQuery({ query: '' }));
          }}
          className={styles.headerLogoMark}
          aria-label="Scinapse small header logo"
        >
          <Icon icon="SCINAPSE_LOGO_SMALL" />
          <div className={styles.instituteLogo}>
            <div className={styles.serviceName}>scinapse</div>
            <div className={styles.instituteName}>{currentUserState.ipInstitute.nameAbbrev}</div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        to="/"
        onClick={() => {
          dispatch(changeSearchQuery({ query: '' }));
          ActionTicketManager.trackTicket({
            pageType: getCurrentPageType(),
            actionType: 'fire',
            actionArea: 'topBar',
            actionTag: 'clickLogo',
            actionLabel: null,
          });
        }}
        className={styles.headerLogo}
        aria-label="Scinapse header logo"
      >
        <Icon icon="SCINAPSE_IMPROVEMENT_LOGO" />
      </Link>
    );
  };

  private getSearchFormContainer = () => {
    const { location } = this.props;
    const shouldShowSearchFormContainer = location.pathname !== HOME_PATH;
    if (!shouldShowSearchFormContainer) return null;

    const currentQueryParams = parse(location.search, { ignoreQueryPrefix: true });
    const filter = SearchQueryManager.objectifyPaperFilter(currentQueryParams.filter);
    const sort = currentQueryParams.sort as PAPER_LIST_SORT_OPTIONS;

    return (
      <div className={styles.searchFormContainer}>
        <SearchInput
          wrapperClassName={styles.searchWrapper}
          listWrapperClassName={styles.suggestionListWrapper}
          inputClassName={styles.searchInput}
          currentFilter={filter}
          sort={sort}
          actionArea="topBar"
          maxCount={MAX_KEYWORD_SUGGESTION_LIST_COUNT}
        />
      </div>
    );
  };

  private handleClickSignOut = async () => {
    const { dispatch } = this.props;

    try {
      await dispatch(signOut());
      this.handleRequestCloseUserDropdown();
    } catch (_err) {
      dispatch({
        type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
        payload: {
          type: 'error',
          message: `Failed to sign out.`,
        },
      });
    }
  };

  private handleOpenSignIn = () => {
    GlobalDialogManager.openSignInDialog({
      authContext: {
        pageType: getCurrentPageType(),
        actionArea: 'topBar',
        actionLabel: null,
      },
      isBlocked: false,
    });
  };

  private handleOpenSignUp = () => {
    GlobalDialogManager.openSignUpDialog({
      authContext: {
        pageType: getCurrentPageType(),
        actionArea: 'topBar',
        actionLabel: null,
      },
      isBlocked: false,
    });
  };

  private handleToggleUserDropdown = () => {
    this.setState({
      userDropdownAnchorElement: this.userDropdownAnchorRef,
      isUserDropdownOpen: !this.state.isUserDropdownOpen,
    });
  };

  private handleRequestCloseUserDropdown = () => {
    if (this.state.isUserDropdownOpen) {
      this.setState({
        isUserDropdownOpen: false,
      });
    }
  };

  private userDropdownMenuItems = () => {
    const { currentUserState, myCollectionsState } = this.props;

    return (
      <div className={styles.menuItems}>
        <MenuItem classes={{ root: styles.userInfoMenuItem }} disabled disableGutters>
          <UserInformation user={currentUserState} />
        </MenuItem>
        {Store.get(ProfileRequestKey) && !currentUserState.profileSlug && (
          <MenuItem classes={{ root: styles.profileInProgressButton }}>
            <a className={styles.linkOnButton} onClick={this.handleRequestCloseUserDropdown}>
              Profile - In Progress -
            </a>
          </MenuItem>
        )}
        {currentUserState.profileSlug && (
          <MenuItem classes={{ root: styles.profileButton }}>
            <Link
              className={styles.linkOnButton}
              onClick={this.handleRequestCloseUserDropdown}
              to={`/profiles/${currentUserState.profileSlug}`}
            >
              Profile
            </Link>
          </MenuItem>
        )}
        <MenuItem classes={{ root: styles.collectionButton }}>
          <Link
            className={styles.linkOnButton}
            onClick={this.handleRequestCloseUserDropdown}
            to={
              !!myCollectionsState && myCollectionsState.collectionIds.length > 0
                ? `/collections/${myCollectionsState.collectionIds[0]}`
                : `/users/${currentUserState.id}/collections`
            }
          >
            Collection
          </Link>
        </MenuItem>
        <MenuItem classes={{ root: styles.keywordSettingsButton }}>
          <Link className={styles.linkOnButton} onClick={this.handleRequestCloseUserDropdown} to="/keyword-settings">
            Keyword alerts
          </Link>
        </MenuItem>
        <MenuItem classes={{ root: styles.settingsButton }}>
          <Link className={styles.linkOnButton} onClick={this.handleRequestCloseUserDropdown} to="/settings">
            Settings
          </Link>
        </MenuItem>
        <MenuItem classes={{ root: styles.signOutButton }} onClick={this.handleClickSignOut}>
          <span className={styles.buttonText}>Sign Out</span>
        </MenuItem>
      </div>
    );
  };

  private getHistoryButton = () => {
    const { paper } = this.props;

    return (
      <div className={styles.historyBtnWrapper}>
        <ResearchHistory paper={paper} />
      </div>
    );
  };

  private getUserDropdown = () => {
    const { currentUserState, myCollectionsState } = this.props;

    const firstCharacterOfUsername = currentUserState.firstName.slice(0, 1).toUpperCase();

    return (
      <div className={styles.rightBox}>
        <div className={styles.rightButtons}>
          {this.getHistoryButton()}
          <Button
            elementType="link"
            size="medium"
            variant="text"
            color="gray"
            onClick={() => {
              this.handleRequestCloseUserDropdown();
              ActionTicketManager.trackTicket({
                pageType: getCurrentPageType(),
                actionType: 'fire',
                actionArea: 'topBar',
                actionTag: 'collectionShow',
                actionLabel: String(myCollectionsState.collectionIds[0]),
              });
            }}
            to={
              !!myCollectionsState && myCollectionsState.collectionIds.length > 0
                ? `/collections/${myCollectionsState.collectionIds[0]}`
                : `/users/${currentUserState.id}/collections`
            }
          >
            <Icon icon="COLLECTION" />
            <span>Collection</span>
          </Button>
        </div>
        <div>
          {!currentUserState.profileImageUrl ? (
            <div
              className={styles.userDropdownChar}
              ref={el => (this.userDropdownAnchorRef = el)}
              onClick={this.handleToggleUserDropdown}
            >
              {firstCharacterOfUsername}
            </div>
          ) : (
            <div
              className={styles.userDropdownImg}
              ref={el => (this.userDropdownAnchorRef = el)}
              onClick={this.handleToggleUserDropdown}
            >
              <div
                style={{ backgroundImage: `url(${currentUserState.profileImageUrl})` }}
                className={styles.profileImage}
              />
            </div>
          )}
          <BubblePopover
            open={this.state.isUserDropdownOpen}
            anchorEl={this.state.userDropdownAnchorElement}
            placement="bottom-end"
            popperOptions={{ positionFixed: true }}
          >
            <ClickAwayListener onClickAway={this.handleRequestCloseUserDropdown}>
              {this.userDropdownMenuItems()}
            </ClickAwayListener>
          </BubblePopover>
        </div>
      </div>
    );
  };

  private getHeaderButtons = () => {
    const { currentUserState } = this.props;
    const { isLoggedIn } = currentUserState;

    if (!isLoggedIn) {
      return (
        <div className={styles.rightBox}>
          <div className={styles.rightButtons}>
            {this.getHistoryButton()}
            <Button
              elementType="button"
              aria-label="Scinapse sign in button"
              size="medium"
              variant="text"
              style={{ marginRight: '8px' }}
              onClick={() => {
                this.handleOpenSignIn();
                trackDialogView('headerSignInOpen');
                ActionTicketManager.trackTicket({
                  pageType: getCurrentPageType(),
                  actionType: 'fire',
                  actionArea: 'topBar',
                  actionTag: 'signInPopup',
                  actionLabel: 'topBar',
                });
              }}
            >
              <span>Sign in</span>
            </Button>
          </div>
          <Button
            elementType="button"
            aria-label="Scinapse sign up button"
            size="medium"
            onClick={() => {
              this.handleOpenSignUp();
              trackDialogView('headerSignUpOpen');
              ActionTicketManager.trackTicket({
                pageType: getCurrentPageType(),
                actionType: 'fire',
                actionArea: 'topBar',
                actionTag: 'signUpPopup',
                actionLabel: 'topBar',
              });
            }}
          >
            <span>Sign up</span>
          </Button>
        </div>
      );
    } else {
      return this.getUserDropdown();
    }
  };
}

export default withRouter(connect(mapStateToProps)(ImprovedHeader));
