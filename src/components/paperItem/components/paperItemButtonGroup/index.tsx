import React from 'react';
import { useSelector } from 'react-redux';
import { Paper } from '@src/model/paper';
import CitationListLinkButton from '../citationListLinkButton';
import SourceButton from '../sourceButton';
import CiteButton from '../citeButton';
import CollectionButton from '../collectionButton';
import { withStyles } from '@src/helpers/withStyles';
import { PaperSource } from '@src/api/paper';
import MoreDropdownButton from '@src/components/moreDropdownButton';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
const s = require('./paperItemButtonGroup.scss');

interface PaperItemButtonGroupProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  paperSource?: PaperSource;
  saved?: boolean;
  dropdownContents?: React.ReactElement[];
}

const PaperItemButtonGroup: React.FC<PaperItemButtonGroupProps> = ({
  paper,
  pageType,
  actionArea,
  paperSource,
  saved,
  dropdownContents,
}) => {
  const userDevice = useSelector<AppState, UserDevice>(state => state.layout.userDevice);
  if (userDevice === UserDevice.MOBILE) {
    return (
      <div className={s.mobileWrapper}>
        <div className={s.buttonWrapper}>
          <CitationListLinkButton paper={paper} pageType={pageType} actionArea={actionArea} />
        </div>
        <div className={s.buttonWrapper}>
          <SourceButton
            paper={paper}
            pageType={pageType}
            actionArea={actionArea}
            paperSource={paperSource}
            isMobile={userDevice === UserDevice.MOBILE}
          />
        </div>
        <div className={s.buttonWrapper}>
          <CollectionButton paper={paper} saved={!!saved} pageType={pageType} actionArea={actionArea} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.groupWrapper}>
      <div className={s.buttonListBox}>
        <CitationListLinkButton paper={paper} pageType={pageType} actionArea={actionArea} />
        <SourceButton paper={paper} pageType={pageType} actionArea={actionArea} paperSource={paperSource} />
        <MoreDropdownButton dropdownContents={dropdownContents} paper={paper} />
      </div>
      <div className={s.buttonListBox}>
        <div className={s.buttonWrapper}>
          <CiteButton paper={paper} pageType={pageType} actionArea={actionArea} />
        </div>
        <div className={s.buttonWrapper}>
          <CollectionButton paper={paper} saved={!!saved} pageType={pageType} actionArea={actionArea} />
        </div>
      </div>
    </div>
  );
};

export default withStyles<typeof PaperItemButtonGroup>(s)(PaperItemButtonGroup);
