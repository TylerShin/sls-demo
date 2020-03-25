import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { Paper } from '@src/model/paper';
import { withStyles } from '@src/helpers/withStyles';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import SearchingPDFBtn from '@src/components/searchingPDFBtn';
import { AUTH_LEVEL, blockUnverifiedUser } from '@src/helpers/checkAuthDialog';
import { ActionArea } from '@src/constants/actionTicket';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';
const styles = require('./pdfSourceButton.scss');

interface PdfDownloadButtonProps {
  paper: Paper;
  isLoading: boolean;
  actionArea: ActionArea;
  onDownloadedPDF: (isDownload: boolean) => void;
  handleSetScrollAfterDownload: () => void;
  wrapperStyle?: React.CSSProperties;
}

const PdfDownloadButton: React.FunctionComponent<PdfDownloadButtonProps> = props => {
  const { paper, isLoading, onDownloadedPDF, handleSetScrollAfterDownload, actionArea } = props;
  const dispatch = useDispatch();

  function trackActionToClickPdfDownloadBtn() {
    ActionTicketManager.trackTicket({
      pageType: 'paperShow',
      actionType: 'fire',
      actionArea: actionArea,
      actionTag: 'downloadPdf',
      actionLabel: String(paper.id),
    });
  }

  if (!paper) {
    return null;
  }

  if (isLoading) {
    return <SearchingPDFBtn isLoading={isLoading} />;
  }

  const pdfUrl = paper.bestPdf && paper.bestPdf.url;

  if (pdfUrl) {
    return (
      <Button
        elementType="anchor"
        href={pdfUrl}
        target="_blank"
        rel="noopener nofollow noreferrer"
        onClick={async e => {
          e.preventDefault();
          trackActionToClickPdfDownloadBtn();

          dispatch(addPaperToRecommendPool({ paperId: paper.id, action: 'downloadPdf' }));

          const isBlocked = await blockUnverifiedUser({
            authLevel: AUTH_LEVEL.VERIFIED,
            actionArea: actionArea,
            actionLabel: 'downloadPdf',
            userActionType: 'downloadPdf',
          });

          if (isBlocked) {
            return;
          }

          window.open(pdfUrl, '_blank');
          onDownloadedPDF(true);
          handleSetScrollAfterDownload();
        }}
      >
        <Icon icon="DOWNLOAD" />
        <span>Download</span>
      </Button>
    );
  }

  return null;
};

export default withStyles<typeof PdfDownloadButton>(styles)(PdfDownloadButton);
