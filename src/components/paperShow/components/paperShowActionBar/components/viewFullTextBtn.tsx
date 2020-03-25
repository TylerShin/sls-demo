import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import SearchingPDFBtn from '@src/components/searchingPDFBtn';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';

const styles = require('./viewFullTextBtn.scss');

interface ViewFullTextBtnProps {
  paperId: string;
  handleClickFullText: () => void;
  isLoading: boolean;
}

const ViewFullTextBtn: React.FC<ViewFullTextBtnProps> = props => {
  const { isLoading, handleClickFullText, paperId } = props;
  const dispatch = useDispatch();

  if (isLoading) {
    return <SearchingPDFBtn isLoading={isLoading} />;
  }

  return (
    <Button
      elementType="button"
      aria-label="View full text button"
      isLoading={isLoading}
      onClick={() => {
        ActionTicketManager.trackTicket({
          pageType: 'paperShow',
          actionType: 'fire',
          actionArea: 'paperDescription',
          actionTag: 'viewFullText',
          actionLabel: String(paperId),
        });
        handleClickFullText();
        dispatch(addPaperToRecommendPool({ paperId, action: 'viewMorePDF' }));
      }}
    >
      <Icon icon="PDF_PAPER" />
      <span>View Paper</span>
    </Button>
  );
};

export default withStyles<typeof ViewFullTextBtn>(styles)(ViewFullTextBtn);
