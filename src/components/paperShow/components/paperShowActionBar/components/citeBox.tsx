import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { Paper } from '@src/model/paper';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';

interface CiteBoxProps {
  paper: Paper;
  actionArea: string;
}

const CiteBox: React.FunctionComponent<CiteBoxProps> = props => {
  const { paper, actionArea } = props;
  const dispatch = useDispatch();

  if (!paper.doi) return null;

  return (
    <Button
      elementType="button"
      aria-label="Cite button"
      color="gray"
      onClick={async () => {
        GlobalDialogManager.openCitationDialog(paper.id);
        dispatch(addPaperToRecommendPool({ paperId: paper.id, action: 'citePaper' }));
        ActionTicketManager.trackTicket({
          pageType: 'paperShow',
          actionType: 'fire',
          actionArea,
          actionTag: 'citePaper',
          actionLabel: String(paper.id),
        });
      }}
    >
      <Icon icon="CITATION" />
      <span>Cite</span>
    </Button>
  );
};

export default CiteBox;
