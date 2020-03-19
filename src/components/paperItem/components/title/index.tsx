import React from 'react';
import { useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { withStyles } from '@src/helpers/withStyles';
import { formulaeToHTMLStr } from '@src/helpers/displayFormula';
import actionTicketManager from '@src/helpers/actionTicketManager';
import { ActionCreators } from '@src/actions/actionTypes';
import Icon from '@src/components/icons';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';
const styles = require('./title.scss');

export interface TitleProps extends RouteComponentProps<any> {
  paper: Paper;
  pageType: PageType;
  actionArea?: ActionArea;
  showNewLabel?: boolean;
  isOpenBlank?: boolean;
}

const Title: React.FC<TitleProps> = props => {
  const { paper, pageType, actionArea, showNewLabel, isOpenBlank } = props;
  const dispatch = useDispatch();

  const handleClickTitle = (fromNewTab?: boolean) => {
    actionTicketManager.trackTicket({
      pageType,
      actionType: 'fire',
      actionArea: actionArea || pageType,
      actionTag: 'paperShow',
      actionLabel: String(paper.id),
    });

    dispatch(addPaperToRecommendPool({ paperId: paper.id, action: 'paperShow' }));

    if (fromNewTab) {
      actionTicketManager.trackTicket({
        pageType,
        actionType: 'fire',
        actionArea: 'titleNewTab',
        actionTag: 'paperShow',
        actionLabel: String(paper.id),
      });
    }

    if (paper.titleHighlighted || paper.abstractHighlighted) {
      dispatch(
        ActionCreators.setHighlightContentInPaperShow({
          title: paper.titleHighlighted || '',
          abstract: paper.abstractHighlighted || '',
        })
      );
    }
  };

  const trimmedTitle = paper.title
    .replace(/^ /gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/#[A-Z0-9]+#/g, '');

  return (
    <div>
      <Link
        to={`/papers/${paper.id}`}
        onClick={() => {
          handleClickTitle(false);
        }}
        dangerouslySetInnerHTML={{ __html: formulaeToHTMLStr(trimmedTitle) }}
        className={styles.title}
        target={!!isOpenBlank ? '_blank' : '_self'}
      />
      <a
        href={`/papers/${paper.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.externalIconWrapper}
        aria-label="External window icon"
      >
        <Icon
          onClick={() => {
            handleClickTitle(true);
          }}
          icon="NEW_TAB"
          className={styles.externalIcon}
        />
        {!paper.isConfirmed && showNewLabel && <span className={styles.newLabel}>NEW</span>}
      </a>
    </div>
  );
};

export default withRouter(withStyles<typeof Title>(styles)(Title));
