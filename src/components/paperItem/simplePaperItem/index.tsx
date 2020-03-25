import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import SimplePaperItemButtonGroup from '../components/simplePaperItemButtonGroup';
import { Paper, paperSchema } from '@src/model/paper';
import { AppState } from '@src/store/rootReducer';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import Title from '../components/title';
import MobileVenueAuthors from '../components/mobileVenueAuthors';
const s = require('./simplePaperItem.scss');
const useStyles = require('isomorphic-style-loader/useStyles');

type ContainerProps = SimplePaperItemProps & {
  paperId: string;
};

interface SimplePaperItemProps {
  pageType: PageType;
  actionArea: ActionArea;
  className?: string;
  contentClassName?: string;
}

export const SimplePaperItem: FC<SimplePaperItemProps & { paper: Paper }> = React.memo(
  ({ pageType, actionArea, className, contentClassName, paper }) => {
    useStyles(s);

    if (!paper) return null;

    return (
      <div className={classNames({ [className!]: !!className })}>
        <div
          className={classNames({
            [s.itemWrapper]: true,
            [contentClassName!]: !!className,
          })}
        >
          <Title paper={paper} actionArea={actionArea} pageType={pageType} />
          <MobileVenueAuthors paper={paper} pageType={pageType} actionArea={actionArea} />
          <div className={s.btnGroupWrapper}>
            <SimplePaperItemButtonGroup
              pageType={pageType}
              actionArea={actionArea}
              paper={paper}
              saved={!!paper.relation && paper.relation.savedInCollections.length > 0}
            />
          </div>
        </div>
      </div>
    );
  },
  isEqual
);

const SimplePaperItemContainer: FC<ContainerProps> = React.memo(
  ({ paperId, pageType, actionArea, className, contentClassName }) => {
    useStyles(s);
    const paper: Paper | null = useSelector(
      (state: AppState) => denormalize(paperId, paperSchema, state.entities),
      isEqual
    );

    if (!paper) return null;

    return (
      <SimplePaperItem
        paper={paper}
        pageType={pageType}
        actionArea={actionArea}
        className={className}
        contentClassName={contentClassName}
      />
    );
  }
);

export default SimplePaperItemContainer;
