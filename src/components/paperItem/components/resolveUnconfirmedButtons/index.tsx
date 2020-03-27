import React, { useState } from 'react';
import { Paper } from '@src/model/paper';
import DeclineButton from './declineButton';
import ConfirmButton from './confirmButton';
import ProfileAPI from '@src/api/profile';
import PlutoAxios from '@src/api/pluto';
import alertToast from '@src/helpers/makePlutoToastAction';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../paperItemButtonGroup/paperItemButtonGroup.scss');

interface ResolveUnconfirmedButtonsProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
  fetchProfileShowData: () => void;
  className?: string;
  isMobile?: boolean;
  ownProfileSlug?: string;
}

const ResolveUnconfirmedButtons: React.FC<ResolveUnconfirmedButtonsProps> = props => {
  const { paper, pageType, actionArea, ownProfileSlug, isMobile, fetchProfileShowData } = props;
  useStyles(s);
  const [isLoading, setIsLoading] = useState(false);

  if (!ownProfileSlug) return null;

  const handleDeclinedPaper = () => {
    setIsLoading(true);

    ProfileAPI.declinedPaper({ profileSlug: ownProfileSlug, paperId: paper.id })
      .then(() => {
        fetchProfileShowData();
        setIsLoading(false);
      })
      .catch(err => {
        const error = PlutoAxios.getGlobalError(err);
        alertToast({
          type: 'error',
          message: error.message,
        });
        setIsLoading(false);
      });
  };

  const handleConfirmedPaper = () => {
    setIsLoading(true);

    ProfileAPI.confirmedPaper({ profileSlug: ownProfileSlug, paperId: paper.id })
      .then(() => {
        fetchProfileShowData();
        setIsLoading(false);
      })
      .catch(err => {
        const error = PlutoAxios.getGlobalError(err);
        alertToast({
          type: 'error',
          message: error.message,
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className={s.buttonWrapper}>
        <DeclineButton
          paper={paper}
          pageType={pageType}
          actionArea={actionArea}
          isLoading={isLoading}
          isMobile={isMobile}
          onDeclinedPaper={handleDeclinedPaper}
        />
      </div>
      <div className={s.buttonWrapper}>
        <ConfirmButton
          paper={paper}
          pageType={pageType}
          actionArea={actionArea}
          isLoading={isLoading}
          isMobile={isMobile}
          onConfirmedPaper={handleConfirmedPaper}
        />
      </div>
    </>
  );
};

export default ResolveUnconfirmedButtons;
