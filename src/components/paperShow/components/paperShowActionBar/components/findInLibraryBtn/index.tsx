import React from 'react';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import SearchingPDFBtn from '@src/components/searchingPDFBtn';
import { Paper } from '@src/model/paper';
import { ActionArea } from '@src/constants/actionTicket';
const s = require('../../actionBar.scss');

interface FindInLibraryBtnProps {
  isLoading: boolean;
  paper: Paper;
  onClick: () => void;
  actionArea: ActionArea;
}

const FindInLibraryBtn: React.FC<FindInLibraryBtnProps> = React.memo(props => {
  const { isLoading, paper, actionArea, onClick } = props;

  if (isLoading) {
    return <SearchingPDFBtn isLoading={isLoading} />;
  }

  return (
    <Button
      elementType="button"
      aria-label="Open dialog to find in library button"
      variant="outlined"
      isLoading={isLoading}
      onClick={async () => {
        ActionTicketManager.trackTicket({
          pageType: 'paperShow',
          actionType: 'fire',
          actionArea,
          actionTag: 'clickFindInLibraryBtn',
          actionLabel: String(paper.id),
        });

        onClick();
      }}
    >
      <Icon icon="SEARCH" />
      <span>Find in Lib.</span>
    </Button>
  );
});

export default withStyles<typeof FindInLibraryBtn>(s)(FindInLibraryBtn);
