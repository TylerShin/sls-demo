import React, { FC } from 'react';
import SimpleCitationListLinkButton from './components/simpleCitationListLinkButton';
import SimpleReadLaterButton from './components/simpleReadLaterButton';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const s = require('./simplePaperItemButtonGroup.scss');
const useStyles = require('isomorphic-style-loader/useStyles');

interface Props {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  saved: boolean;
}

const SimplePaperItemButtonGroup: FC<Props> = ({ paper, pageType, actionArea, saved }) => {
  useStyles(s);

  return (
    <div className={s.groupWrapper}>
      <div>
        <SimpleCitationListLinkButton
          paperId={paper.id}
          citedCount={paper.citedCount}
          pageType={pageType}
          actionArea={actionArea}
        />
      </div>
      <div>
        <SimpleReadLaterButton paperId={paper.id} saved={!!saved} pageType={pageType} actionArea={actionArea} />
      </div>
    </div>
  );
};

export default SimplePaperItemButtonGroup;
