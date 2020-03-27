import React from 'react';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';

interface ConfirmButtonProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  className?: string;
  isMobile?: boolean;
  onConfirmedPaper?: () => void;
  isLoading?: boolean;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  paper,
  pageType,
  actionArea,
  className,
  isLoading,
  onConfirmedPaper,
}) => {
  if (!onConfirmedPaper) return null;

  return (
    <div className={className}>
      <Button
        elementType="button"
        aria-label="Confirm button"
        size="small"
        variant={'contained'}
        color={'blue'}
        onClick={async () => {
          ActionTicketManager.trackTicket({
            pageType,
            actionType: 'fire',
            actionArea: actionArea || pageType,
            actionTag: 'confirmedPaper',
            actionLabel: String(paper.id),
          });
          onConfirmedPaper();
        }}
        isLoading={isLoading}
      >
        <Icon icon="CHECK" />
        <span>Accept</span>
      </Button>
    </div>
  );
};
export default ConfirmButton;
