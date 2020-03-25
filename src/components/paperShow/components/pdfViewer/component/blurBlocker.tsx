import React from 'react';
import { useDispatch } from 'react-redux';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import { blockUnverifiedUser, AUTH_LEVEL } from '@src/helpers/checkAuthDialog';
import actionTicketManager from '@src/helpers/actionTicketManager';
import { addPaperToRecommendPool } from '@src/actions/recommendPool';
const s = require('./blurBlocker.scss');

interface BlurBlockerProps {
  paperId: string;
}

const BlurBlocker: React.FC<BlurBlockerProps> = ({ paperId }) => {
  const dispatch = useDispatch();

  return (
    <div className={s.wrapper}>
      <div
        onClick={async () => {
          dispatch(addPaperToRecommendPool({ paperId, action: 'viewMorePDF' }));

          actionTicketManager.trackTicket({
            pageType: 'paperShow',
            actionArea: 'pdfViewer',
            actionTag: 'viewMorePDF',
            actionLabel: 'viewMorePDF',
            actionType: 'fire',
          });

          await blockUnverifiedUser({
            authLevel: AUTH_LEVEL.VERIFIED,
            actionArea: 'pdfViewer',
            actionLabel: 'viewMorePDF',
          });
        }}
        className={s.box}
      >
        <div className={s.btnLikeText}>By signing up, view conclusion and full text.</div>
        <div className={s.subText}>Read More</div>
        <Icon icon="ARROW_DOWN" className={s.arrowIcon} />
      </div>
    </div>
  );
};

export default withStyles<typeof BlurBlocker>(s)(BlurBlocker);
