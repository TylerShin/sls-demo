import { useDispatch } from 'react-redux';
import React, { FC, useState } from 'react';
import { PendingPaper } from '@src/reducers/profilePendingPaperList';
import Icon from '@src/components/icons';
import FindAuthorOfPendingPaperForm from './components/findAuthorOfPendingPaperForm';
import FindPaperOfPendingPaperForm from './components/findPaperOfPendingPaperForm';
import { markTryAgainProfilePendingPaper } from '@src/actions/profile';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./resolvedPendingPaperDialog.scss');

export enum CURRENT_STEP {
  FIND_PAPER,
  FIND_AUTHOR,
}

interface ResolvedPendingPaperDialogBodyProps {
  paper: PendingPaper;
  handleCloseDialog: () => void;
}

const ResolvedPendingPaperDialogBody: FC<ResolvedPendingPaperDialogBodyProps> = ({ paper, handleCloseDialog }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState<CURRENT_STEP>(CURRENT_STEP.FIND_PAPER);
  const [targetResolvedPaperId, setTargetResolvedPaperId] = useState<string>('');

  const handleClickNextBtn = async (targetPaperId: string | null) => {
    if (!targetPaperId) {
      await dispatch(markTryAgainProfilePendingPaper(paper.id));
      return handleCloseDialog();
    }

    setTargetResolvedPaperId(targetPaperId);
    setCurrentStep(CURRENT_STEP.FIND_AUTHOR);
  };

  if (currentStep === CURRENT_STEP.FIND_PAPER)
    return (
      <FindPaperOfPendingPaperForm
        recommendedPaperId={paper.paperId}
        onClickNextBtn={handleClickNextBtn}
        onCloseDialog={handleCloseDialog}
      />
    );

  return (
    <FindAuthorOfPendingPaperForm
      targetResolvedPaperId={targetResolvedPaperId}
      pendingPaperId={paper.id}
      onCloseDialog={handleCloseDialog}
    />
  );
};

interface ResolvedPendingPaperDialogProps {
  paper: PendingPaper;
  handleCloseDialog: () => void;
}

const ResolvedPendingPaperDialog: FC<ResolvedPendingPaperDialogProps> = ({ handleCloseDialog, paper }) => {
  useStyles(s);

  return (
    <div className={s.dialogPaper}>
      <div className={s.boxContainer}>
        <div className={s.boxWrapper}>
          <div style={{ marginTop: 0 }} className={s.header}>
            <div className={s.title}>Resolved Pending Publication</div>
            <Icon icon="X_BUTTON" className={s.iconWrapper} onClick={handleCloseDialog} />
          </div>
          <div className={s.dialogBody}>
            <ResolvedPendingPaperDialogBody paper={paper} handleCloseDialog={handleCloseDialog} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolvedPendingPaperDialog;
