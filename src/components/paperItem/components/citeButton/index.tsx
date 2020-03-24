import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { withStyles } from '@src/helpers/withStyles';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';
const styles = require('./citeButton.scss');

interface CiteButtonProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  className?: string;
  isMobile?: boolean;
}

const CiteButton: React.FC<CiteButtonProps> = ({ paper, pageType, actionArea, className, isMobile }) => {
  const dispatch = useDispatch();

  if (!paper.doi) return null;

  return (
    <div className={className}>
      <Button
        elementType="button"
        aria-label="Cite button"
        size="small"
        variant={isMobile ? 'contained' : 'outlined'}
        color={isMobile ? 'black' : 'blue'}
        onClick={() => {
          GlobalDialogManager.openCitationDialog(paper.id);
          dispatch(addPaperToRecommendPool({ paperId: paper.id, action: 'citePaper' }));
          ActionTicketManager.trackTicket({
            pageType,
            actionType: 'fire',
            actionArea: actionArea || pageType,
            actionTag: 'citePaper',
            actionLabel: String(paper.id),
          });
        }}
      >
        <Icon icon="CITATION" />
        <span>Cite</span>
      </Button>
    </div>
  );
};

export default withStyles<typeof CiteButton>(styles)(CiteButton);
