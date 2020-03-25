import React, { FC, memo } from 'react';
import { Paper } from '../../../model/paper';
import { PaperSource } from '../../../api/paper';
import Title from '../components/title';
import Abstract from '../components/abstract';
import MobileVenueAuthors from '../components/mobileVenueAuthors';
import PaperItemButtonGroup from '../components/paperItemButtonGroup';
import { PageType, ActionArea } from '@src/constants/actionTicket';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./paperItem.scss');

interface Props {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  sourceDomain?: PaperSource;
}

const MobileFullPaperItem: FC<Props> = memo(({ paper, pageType, actionArea, sourceDomain }) => {
  useStyles(s);

  return (
    <div className={s.paperItemWrapper}>
      <Title paper={paper} actionArea={actionArea} pageType={pageType} />
      <MobileVenueAuthors paper={paper} pageType={pageType} actionArea={actionArea} />
      <Abstract
        paperId={paper.id}
        abstract={paper.abstractHighlighted || paper.abstract}
        pageType={pageType}
        actionArea={actionArea}
      />
      <PaperItemButtonGroup
        paper={paper}
        pageType={pageType}
        actionArea={actionArea}
        paperSource={sourceDomain}
        saved={!!paper.relation && paper.relation.savedInCollections.length > 0}
      />
    </div>
  );
});

export default MobileFullPaperItem;
