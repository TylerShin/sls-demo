import React from 'react';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import formatNumber from '@src/helpers/formatNumber';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';

interface CitationListLinkButtonProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
}

const CitationListLinkButton: React.FC<CitationListLinkButtonProps> = ({ paper, actionArea, pageType }) => {
  if (!paper.citedCount) return null;

  return (
    <Button
      elementType="link"
      to={{
        pathname: `/papers/${paper.id}`,
        hash: 'cited',
      }}
      size="small"
      color="black"
      onClick={() => {
        ActionTicketManager.trackTicket({
          pageType,
          actionType: 'fire',
          actionArea: actionArea || pageType,
          actionTag: 'citedList',
          actionLabel: String(paper.id),
        });
      }}
    >
      <span>{`${formatNumber(paper.citedCount)} Citations`}</span>
    </Button>
  );
};

export default CitationListLinkButton;
