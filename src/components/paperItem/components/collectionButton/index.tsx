import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { blockUnverifiedUser, AUTH_LEVEL } from '@src/helpers/checkAuthDialog';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';

interface CollectionButtonProps {
  paper: Paper;
  saved: boolean;
  pageType: PageType;
  actionArea: ActionArea;
  buttonStyle?: React.CSSProperties;
}

const CollectionButton: React.FC<CollectionButtonProps> = ({ saved, paper, pageType, actionArea, buttonStyle }) => {
  const dispatch = useDispatch();
  const buttonContent = saved ? 'Saved' : 'Save';

  return (
    <Button
      elementType="button"
      aria-label="Save paper to collection button"
      size="small"
      onClick={async () => {
        const action = saved ? 'savedCollection' : 'addToCollection';
        dispatch(addPaperToRecommendPool({ paperId: paper.id, action: 'addToCollection' }));
        ActionTicketManager.trackTicket({
          pageType,
          actionType: 'fire',
          actionArea,
          actionTag: action,
          actionLabel: String(paper.id),
        });
        const isBlocked = await blockUnverifiedUser({
          authLevel: AUTH_LEVEL.VERIFIED,
          actionArea: actionArea || pageType,
          actionLabel: action,
          userActionType: action,
        });

        if (!isBlocked) {
          GlobalDialogManager.openCollectionDialog(paper.id);
        }
      }}
      style={saved ? { backgroundColor: '#34495e', borderColor: '#34495e', ...buttonStyle } : { ...buttonStyle }}
    >
      <Icon icon="BOOKMARK" />
      <span>{buttonContent}</span>
    </Button>
  );
};

export default CollectionButton;
