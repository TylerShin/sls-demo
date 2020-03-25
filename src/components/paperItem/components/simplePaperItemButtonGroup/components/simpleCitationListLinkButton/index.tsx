import React, { FC } from 'react';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import formatNumber from '@src/helpers/formatNumber';
import { PageType, ActionArea } from '@src/constants/actionTicket';

interface Props {
  paperId: string;
  citedCount: number;
  pageType: PageType;
  actionArea: ActionArea;
}

const SimpleCitationListLinkButton: FC<Props> = ({ paperId, citedCount, pageType, actionArea }) => {
  if (!citedCount) return null;

  function handleClickLink() {
    ActionTicketManager.trackTicket({
      pageType,
      actionType: 'fire',
      actionArea: actionArea || pageType,
      actionTag: 'citedList',
      actionLabel: String(paperId),
    });
  }

  return (
    <Button
      size="small"
      variant="text"
      color="gray"
      onClick={handleClickLink}
      elementType="link"
      to={{
        pathname: `/papers/${paperId}`,
        hash: 'cited',
      }}
    >
      <span>{`${formatNumber(citedCount)} Citations`}</span>
    </Button>
  );
};

export default SimpleCitationListLinkButton;
