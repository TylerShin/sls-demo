import React, { FC, useState, useRef, useEffect } from 'react';
import { useParams, useLocation, RouteComponentProps } from 'react-router-dom';
import { isEqual } from 'lodash';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { AppState } from '@src/store/rootReducer';
import DesktopPagination from '@src/components/desktopPagination';
import ModifyProfile, { ModifyProfileFormState } from '@src/components/modifyProfile';
import ProfileShowHeader from '@src/pages/authorShow/components/authorShowHeader/profileShowHeader';
import Icon from '@src/components/icons';
import formatNumber from '@src/helpers/formatNumber';
import ProfileCvSection from './components/profileCVSection';
import { Affiliation } from '@src/model/affiliation';
import { SuggestAffiliation } from '@src/api/suggest';
import ProfileShowPageHelmet from '@src/components/helmet/profileShow';
import RepresentativePaperListSection from './components/representativePapers';
import { selectHydratedProfile, Profile } from '@src/model/profile';
import {
  fetchProfileData,
  updateProfile,
  fetchProfilePapers,
  fetchProfilePendingPapers,
  fetchRepresentativePapers,
} from '@src/actions/profile';
import getQueryParamsObject from '@src/helpers/getQueryParamsObject';
import { PendingPaper } from '@src/reducers/profilePendingPaperList';
import PendingPaperList from '@src/components/pendingPaperList';
import PaperImportDialog from '@src/components/paperImportDialog';
import ProfilePaperItem from '@src/components/paperItem/profilePaperItem';
import { fetchAuthorShowPageData } from './sideEffects';
import PendingDescriptionDialog from './components/pendingDescriptionDialog';
import { openImportPaperDialog } from '@src/reducers/importPaperDialog';
import { IMPORT_SOURCE_TAB } from './types';
import AllRepresentativePaperDialog from './components/allRepresentativePaperDialog';
import { CoAuthor } from '@src/components/coAuthor';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./profileShow.scss');

enum AvailableTab {
  PUBLICATIONS,
  INFORMATION,
}

type ProfilePageProps = RouteComponentProps<{ profileSlug: string }>;

const ProfilePage: FC<ProfilePageProps> = ({ match }) => {
  useStyles(s);
  const { profileSlug } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = getQueryParamsObject(location.search);
  const currentPage = parseInt(queryParams.page || '', 10) || 0;
  const profile = useSelector<AppState, Profile | undefined>(state => selectHydratedProfile(state, profileSlug));
  const userDevice = useSelector((state: AppState) => state.layout.userDevice);
  const totalPaperCount = useSelector((state: AppState) => state.profilePaperListState.totalCount);
  const maxPage = useSelector((state: AppState) => state.profilePaperListState.maxPage);
  const pendingPapers = useSelector<AppState, PendingPaper[]>(
    state => state.profilePendingPaperListState.papers,
    isEqual
  );
  const paperIds = useSelector<AppState, string[]>(state => state.profilePaperListState.paperIds, isEqual);
  const representativePaperIds = useSelector<AppState, string[]>(
    state => state.profileRepresentativePaperListState.paperIds,
    isEqual
  );
  const totalRepresentativePaperCount = useSelector<AppState, number>(
    state => state.profileRepresentativePaperListState.totalCount
  );
  const currentUser = useSelector((state: AppState) => state.currentUser, isEqual);
  const [isOpenModifyProfileDialog, setIsOpenModifyProfileDialog] = useState(false);
  const [isOpenPendingDescriptionDialog, setIsOpenPendingDescriptionDialog] = useState(false);
  const [isOpenRepresentativePapersDialog, setIsOpenRepresentativePapersDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(AvailableTab.PUBLICATIONS);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const shouldFetch = useSelector(
    (state: AppState) => !state.configuration.succeedAPIFetchAtServer || state.configuration.renderedAtClient
  );
  const lastShouldFetch = useRef(shouldFetch);

  useEffect(() => {
    if (!lastShouldFetch.current) return;
    if (!profileSlug) return;

    dispatch(fetchProfileData(profileSlug));
    dispatch(fetchProfilePendingPapers(profileSlug));
    dispatch(fetchRepresentativePapers({ profileSlug }));
  }, [profileSlug, dispatch, currentUser]);

  useEffect(() => {
    if (!lastShouldFetch.current) {
      lastShouldFetch.current = true;
      return;
    }
    if (!profileSlug) return;

    dispatch(fetchProfilePapers({ profileSlug, page: currentPage }));
  }, [profileSlug, currentPage, dispatch, currentUser]);

  if (!profile || !profileSlug) return null;

  return (
    <div className={s.authorShowPageWrapper}>
      <ProfileShowPageHelmet profile={profile} />
      <div className={s.rootWrapper}>
        <ProfileShowHeader
          profile={profile}
          userDevice={userDevice}
          currentUser={currentUser}
          rightBoxContent={
            profile.isEditable && (
              <Button
                elementType="button"
                size="medium"
                variant="outlined"
                color="gray"
                onClick={() => setIsOpenModifyProfileDialog(prev => !prev)}
              >
                <Icon icon="PEN" />
                <span>Edit Profile</span>
              </Button>
            )
          }
          navigationContent={
            <div className={s.tabNavigationWrapper}>
              <div
                onClick={() => setActiveTab(AvailableTab.PUBLICATIONS)}
                className={classNames({
                  [s.currentTabNavigationItem]: activeTab === AvailableTab.PUBLICATIONS,
                  [s.tabNavigationItem]: activeTab !== AvailableTab.PUBLICATIONS,
                })}
              >
                PUBLICATIONS
              </div>
              <div
                onClick={() => setActiveTab(AvailableTab.INFORMATION)}
                className={classNames({
                  [s.currentTabNavigationItem]: activeTab === AvailableTab.INFORMATION,
                  [s.tabNavigationItem]: activeTab !== AvailableTab.INFORMATION,
                })}
              >
                INFORMATION
              </div>
            </div>
          }
        />
        <div className={s.contentBox}>
          <div className={s.container}>
            {activeTab === AvailableTab.INFORMATION && <ProfileCvSection profile={profile} />}
            {activeTab === AvailableTab.PUBLICATIONS && (
              <>
                <div className={s.leftContentWrapper}>
                  <RepresentativePaperListSection
                    profileSlug={profileSlug}
                    paperIds={representativePaperIds}
                    isEditable={profile.isEditable}
                    totalCount={totalRepresentativePaperCount}
                    fetchProfileShowData={() =>
                      fetchAuthorShowPageData({ dispatch, match, pathname: location.pathname })
                    }
                    onClickOpenDialog={() => setIsOpenRepresentativePapersDialog(true)}
                  />
                  {pendingPapers.length > 0 && profile.isEditable && (
                    <>
                      <div className={s.allPublicationHeader}>
                        <span className={s.sectionTitle}>Pending Publications</span>
                        <span className={s.countBadge}>{pendingPapers.length}</span>
                        <div
                          onClick={() => setIsOpenPendingDescriptionDialog(true)}
                          className={classNames({
                            [s.rightBox]: true,
                            [s.pendingLink]: true,
                          })}
                        >
                          What are 'pending' publications?
                        </div>
                      </div>
                      <div className={s.divider} />
                      <PendingPaperList papers={pendingPapers} isEditable={profile.isEditable && false} />
                    </>
                  )}

                  <>
                    <div className={s.allPublicationHeader}>
                      <span className={s.sectionTitle}>Publications</span>
                      <span className={s.countBadge}>{formatNumber(totalPaperCount)}</span>
                      <div className={s.rightBox}>
                        {profile.isEditable && false && (
                          <Button
                            elementType="button"
                            color="gray"
                            variant="outlined"
                            title="Update or add publication information here by using Google Scholar Profile page, BibTex, or citation string. This is not for uploading the publication itself."
                            onClick={() =>
                              dispatch(
                                openImportPaperDialog({
                                  activeImportSourceTab: IMPORT_SOURCE_TAB.BIBTEX,
                                  profileSlug,
                                })
                              )
                            }
                          >
                            <Icon icon="ADD_NOTE" />
                            <span>Import Publications</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className={s.paperCountMetadata}>
                      {currentPage + 1} page of {formatNumber(maxPage)} pages ({formatNumber(totalPaperCount)} results)
                    </div>
                    <div className={s.divider} />
                    {paperIds.length === 0 && profile.isEditable && false && (
                      <div className={s.noPapers}>
                        <span className={s.noPaperContent}>You have not yet imported your paper list.</span>
                        <Button
                          elementType="button"
                          variant="outlined"
                          title="Update or add publication information here by using Google Scholar Profile page, BibTex, or citation string. This is not for uploading the publication itself."
                          onClick={() =>
                            dispatch(
                              openImportPaperDialog({ activeImportSourceTab: IMPORT_SOURCE_TAB.BIBTEX, profileSlug })
                            )
                          }
                        >
                          <Icon icon="ADD_NOTE" />
                          <span>Import Publications</span>
                        </Button>
                      </div>
                    )}
                    {paperIds.map(id => (
                      <ProfilePaperItem
                        key={id}
                        paperId={id}
                        pageType="profileShow"
                        actionArea="paperList"
                        ownProfileSlug={profile.slug}
                        isEditable={false}
                        fetchProfileShowData={() =>
                          fetchAuthorShowPageData({ dispatch, match, pathname: location.pathname })
                        }
                      />
                    ))}
                    <DesktopPagination
                      type="AUTHOR_SHOW_PAPERS_PAGINATION"
                      getLinkDestination={page => `/profiles/${profileSlug}?page=${page - 1}`}
                      totalPage={maxPage}
                      currentPageIndex={currentPage}
                      wrapperStyle={{
                        margin: '45px 0 40px 0',
                      }}
                    />
                  </>
                  {pendingPapers.length > 0 && !profile.isEditable && (
                    <>
                      <div className={s.allPublicationHeader}>
                        <span className={s.sectionTitle}>Pending Publications</span>
                        <span className={s.countBadge}>{pendingPapers.length}</span>
                        <div
                          className={classNames({
                            [s.rightBox]: true,
                            [s.pendingLink]: true,
                          })}
                          onClick={() => setIsOpenPendingDescriptionDialog(true)}
                        >
                          What are 'pending' publications?
                        </div>
                      </div>
                      <div className={s.divider} />
                      <PendingPaperList papers={pendingPapers} isEditable={profile.isEditable} />
                    </>
                  )}
                </div>
                <div className={s.rightContentWrapper}>
                  <div>
                    <div className={s.coAuthorHeader}>Close Researchers</div>
                    {profile.coauthors.map(coauthor => (
                      <CoAuthor key={coauthor.id} author={coauthor} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ModifyProfile
        handleClose={() => setIsOpenModifyProfileDialog(prev => !prev)}
        isOpen={isOpenModifyProfileDialog}
        isLoading={isUpdatingProfile}
        handleSubmitForm={async (profileForm: ModifyProfileFormState) => {
          let affiliationId: string | null = null;
          let affiliationName = '';
          if ((profileForm.currentAffiliation as Affiliation).name) {
            affiliationId = (profileForm.currentAffiliation as Affiliation).id;
            affiliationName = (profileForm.currentAffiliation as Affiliation).name;
          } else if ((profileForm.currentAffiliation as SuggestAffiliation).keyword) {
            affiliationId = (profileForm.currentAffiliation as SuggestAffiliation).affiliationId;
            affiliationName = (profileForm.currentAffiliation as SuggestAffiliation).keyword;
          }
          setIsUpdatingProfile(true);
          await dispatch(
            updateProfile({
              id: profile.slug,
              bio: profileForm.bio || null,
              email: profileForm.email,
              first_name: profileForm.firstName,
              last_name: profileForm.lastName,
              web_page: profileForm.website || null,
              affiliation_id: affiliationId,
              affiliation_name: affiliationName,
              is_email_public: !profileForm.hideEmail,
            })
          );
          setIsUpdatingProfile(false);
          setIsOpenModifyProfileDialog(prev => !prev);
        }}
        initialValues={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          currentAffiliation: { id: profile.affiliationId, name: profile.affiliationName } || '',
          bio: profile.bio || '',
          website: profile.webPage || '',
          email: profile.email,
          hideEmail: !profile.isEmailPublic,
        }}
      />
      <PaperImportDialog />
      <PendingDescriptionDialog
        open={isOpenPendingDescriptionDialog}
        onClose={() => setIsOpenPendingDescriptionDialog(false)}
      />
      <AllRepresentativePaperDialog
        isOpen={isOpenRepresentativePapersDialog}
        profileSlug={profileSlug}
        isEditable={false}
        fetchProfileShowData={() => fetchAuthorShowPageData({ dispatch, match, pathname: location.pathname })}
        onCloseDialog={() => setIsOpenRepresentativePapersDialog(false)}
      />
    </div>
  );
};

export default ProfilePage;
