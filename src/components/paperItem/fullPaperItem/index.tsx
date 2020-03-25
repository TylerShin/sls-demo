import React, { FC, memo } from 'react';
import { useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import { isEqual } from 'lodash';
import { Paper, paperSchema } from '@src/model/paper';
import Title from '../components/title';
import Abstract from '../components/abstract';
import BlockVenueAuthor from '../components/blockVenueAuthor';
import PaperItemButtonGroup from '../components/paperItemButtonGroup';
import { PaperSource } from '@src/api/paper';
import Figures from '../components/figures';
import { AppState } from '@src/store/rootReducer';
import MobileFullPaperItem from './mobileFullPaperItem';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { UserDevice } from '@src/reducers/layout';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./paperItem.scss');

interface BasePaperItemProps {
  pageType: PageType;
  actionArea: ActionArea;
  hideFigure?: boolean;
  sourceDomain?: PaperSource;
  ownProfileSlug?: string;
}
type PaperItemProps = BasePaperItemProps & { paperId: string };
type FullPaperItemWithPaperProps = BasePaperItemProps & { paper: Paper };

export const FullPaperItemWithPaper: FC<FullPaperItemWithPaperProps> = memo(
  ({ paper, actionArea, pageType, sourceDomain, hideFigure, ownProfileSlug }) => {
    const userDevice = useSelector((state: AppState) => state.layout.userDevice);
    if (userDevice === UserDevice.MOBILE) {
      return (
        <MobileFullPaperItem paper={paper} actionArea={actionArea} pageType={pageType} sourceDomain={sourceDomain} />
      );
    }

    return (
      <div className={s.paperItemWrapper}>
        <Title paper={paper} actionArea={actionArea} pageType={pageType} />
        <div style={{ marginTop: '12px' }}>
          <BlockVenueAuthor paper={paper} pageType={pageType} actionArea={actionArea} ownProfileSlug={ownProfileSlug} />
        </div>
        <Abstract
          paperId={paper.id}
          abstract={paper.abstractHighlighted || paper.abstract}
          pageType={pageType}
          actionArea={actionArea}
        />
        {!hideFigure && <Figures figures={paper.figures} paperId={paper.id} />}
        <PaperItemButtonGroup
          paper={paper}
          pageType={pageType}
          actionArea={actionArea}
          paperSource={sourceDomain}
          saved={!!paper.relation && paper.relation.savedInCollections.length > 0}
        />
      </div>
    );
  },
  isEqual
);

const FullPaperItem: FC<PaperItemProps> = memo(({ paperId, ...props }) => {
  useStyles(s);
  const paper = useSelector<AppState, Paper | undefined>(
    state => denormalize(paperId, paperSchema, state.entities),
    isEqual
  );

  if (!paper) return null;

  return <FullPaperItemWithPaper paper={paper} {...props} />;
});

export default FullPaperItem;
