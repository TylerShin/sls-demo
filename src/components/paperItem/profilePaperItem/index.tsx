import React, { FC, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { denormalize } from 'normalizr';
import { isEqual } from 'lodash';
import { PaperSource } from '@src/api/paper';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
import { Paper, paperSchema } from '@src/model/paper';
import Title from '../components/title';
import Abstract from '../components/abstract';
import BlockVenueAuthor from '../components/blockVenueAuthor';
import UnconfirmedPaperItemButtonGroup from '../components/unconfirmedPaperItemButtonGroup';
import MobileVenueAuthors from '../components/mobileVenueAuthors';
import PaperItemMoreDropdownItem from '../components/moreDropdownItem';
import { markRepresentativePaper, unMarkRepresentativePaper } from '@src/actions/profile';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./profilePaperItem.scss');

interface BasePaperItemProps {
  pageType: PageType;
  actionArea: ActionArea;
  fetchProfileShowData: () => void;
  sourceDomain?: PaperSource;
  ownProfileSlug?: string;
  isEditable?: boolean;
  isRepresentative?: boolean;
  isOpenBlank?: boolean;
}
type PaperItemProps = BasePaperItemProps & { paperId: string };
type ProfilePaperItemWithPaperProps = BasePaperItemProps & { paper: Paper };

export const ProfilePaperItemWithPaper: FC<ProfilePaperItemWithPaperProps> = memo(
  ({
    paper,
    actionArea,
    pageType,
    sourceDomain,
    ownProfileSlug,
    isEditable,
    fetchProfileShowData,
    isRepresentative,
    isOpenBlank,
  }) => {
    const dispatch = useDispatch();
    const userDevice = useSelector((state: AppState) => state.layout.userDevice);

    let controlPaperButton = (
      <PaperItemMoreDropdownItem
        key={0}
        content="Mark Representative"
        onClick={() => {
          dispatch(markRepresentativePaper(paper.id, ownProfileSlug!));
        }}
      />
    );

    if (isRepresentative) {
      controlPaperButton = (
        <PaperItemMoreDropdownItem
          key={0}
          content="Unmark Representative"
          onClick={() => {
            if (confirm('Are you SURE to unmark this representative publication?')) {
              dispatch(unMarkRepresentativePaper(paper.id, ownProfileSlug!));
            }
          }}
        />
      );
    }

    let venueAuthors = (
      <div style={{ marginTop: '12px' }}>
        <BlockVenueAuthor
          paper={paper}
          pageType="collectionShow"
          actionArea="paperList"
          ownProfileSlug={ownProfileSlug}
        />
      </div>
    );

    if (userDevice === UserDevice.MOBILE) {
      venueAuthors = <MobileVenueAuthors paper={paper} pageType="collectionShow" actionArea="paperList" />;
    }

    return (
      <div className={s.paperItemWrapper}>
        <Title
          paper={paper}
          actionArea={actionArea}
          pageType={pageType}
          showNewLabel={true}
          isOpenBlank={isOpenBlank}
        />
        {venueAuthors}
        <Abstract
          paperId={paper.id}
          abstract={paper.abstractHighlighted || paper.abstract}
          pageType={pageType}
          actionArea={actionArea}
        />
        <UnconfirmedPaperItemButtonGroup
          paper={paper}
          pageType={pageType}
          actionArea={actionArea}
          paperSource={sourceDomain}
          saved={!!paper.relation && paper.relation.savedInCollections.length > 0}
          ownProfileSlug={ownProfileSlug}
          isEditable={isEditable}
          fetchProfileShowData={fetchProfileShowData}
          dropdownContents={isEditable ? [controlPaperButton] : []}
        />
      </div>
    );
  },
  isEqual
);

const ProfilePaperItem: FC<PaperItemProps> = memo(({ paperId, ...props }) => {
  useStyles(s);
  const paper = useSelector<AppState, Paper | undefined>(
    state => denormalize(paperId, paperSchema, state.entities),
    isEqual
  );

  if (!paper) return null;

  return <ProfilePaperItemWithPaper paper={paper} {...props} />;
});

export default ProfilePaperItem;
