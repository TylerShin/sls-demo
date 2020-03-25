import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { blockUnverifiedUser, AUTH_LEVEL } from '@src/helpers/checkAuthDialog';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import Icon from '@src/components/icons';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { AppState } from '@src/store/rootReducer';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';

interface Props {
  paperId: string;
  saved: boolean;
  pageType: PageType;
  actionArea: ActionArea;
}

const SimpleReadLaterButton: FC<Props> = ({ paperId, saved, pageType, actionArea }) => {
  const dispatch = useDispatch();
  const userHasCollection = useSelector<AppState, boolean>(state => {
    return state.myCollections.collectionIds && state.myCollections.collectionIds.length > 0;
  });

  return (
    <Button
      variant="text"
      elementType="button"
      aria-label="Simple read later button"
      size="small"
      color={saved ? 'black' : 'blue'}
      onClick={async () => {
        const actionLabel = saved ? 'addToCollection' : 'savedCollection';
        dispatch(addPaperToRecommendPool({ paperId, action: 'addToCollection' }));
        ActionTicketManager.trackTicket({
          pageType,
          actionType: 'fire',
          actionArea,
          actionTag: actionLabel,
          actionLabel: String(paperId),
        });
        const isBlocked = await blockUnverifiedUser({
          authLevel: AUTH_LEVEL.VERIFIED,
          actionArea: actionArea || pageType,
          actionLabel: actionLabel,
          userActionType: actionLabel,
        });
        if (isBlocked) return;

        if (userHasCollection) GlobalDialogManager.openCollectionDialog(paperId);
        else GlobalDialogManager.openNewCollectionDialog(paperId);
      }}
    >
      <Icon icon="BOOKMARK" />
      <span>Read Later</span>
    </Button>
  );
};

export default SimpleReadLaterButton;
