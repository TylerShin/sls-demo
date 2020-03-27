import React, { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, GroupButton } from '@pluto_network/pluto-design-elements';
import { ONBOARDING_STEPS, CURRENT_ONBOARDING_PROGRESS_STEP } from '../../types';
import { clickPrevStep, clickSkipStep, clickNextStep } from '@src/reducers/profileOnboarding';
import { isStepOptional } from '../../helper';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
import Icon from '@src/components/icons';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./onboardingFooter.scss');

enum BUTTON_ACTION {
  NEXT,
  SKIP,
  PREV,
}

interface OnboardingFooterProps {
  activeStep: CURRENT_ONBOARDING_PROGRESS_STEP;
  shouldShow: boolean;
}

const OnboardingFooter: FC<OnboardingFooterProps> = ({ activeStep, shouldShow }) => {
  useStyles(s);

  const dispatch = useDispatch();
  const { totalImportedCount, successCount, pendingCount, isMobile } = useSelector((appState: AppState) => ({
    totalImportedCount: appState.importPaperDialogState.totalImportedCount,
    successCount: appState.importPaperDialogState.successCount,
    pendingCount: appState.importPaperDialogState.pendingCount,
    isMobile: appState.layout.userDevice === UserDevice.MOBILE,
  }));

  const onClickActionBtn = (type: BUTTON_ACTION) => {
    if (type === BUTTON_ACTION.PREV) {
      return dispatch(clickPrevStep());
    }

    if (type === BUTTON_ACTION.NEXT) {
      dispatch(clickNextStep());
    } else {
      dispatch(clickSkipStep());
    }

    if (activeStep === CURRENT_ONBOARDING_PROGRESS_STEP.MATCH_UNSYNCED_PUBS && totalImportedCount < 10) {
      dispatch(clickSkipStep());
    }
  };

  const importPublicationCount = useMemo(
    () => (
      <div className={s.countSection}>
        <div className={s.totalCount}>
          Total upload count<span className={s.highlightNumber}>{`(${totalImportedCount})`}</span>
        </div>
        <div className={s.eachCount}>
          Success <span className={s.highlightNumber}>{`(${successCount})`}</span>
          {` | `}
          Pending <span className={s.highlightNumber}>{`(${pendingCount})`}</span>
        </div>
      </div>
    ),
    [totalImportedCount, successCount, pendingCount]
  );

  const skipButton = (
    <Button
      elementType="button"
      variant="text"
      color="gray"
      size={isMobile ? 'small' : 'large'}
      onClick={() => onClickActionBtn(BUTTON_ACTION.SKIP)}
    >
      <span>SKIP</span>
    </Button>
  );

  if (!shouldShow) return null;

  return (
    <div className={s.onboardingFooterWrapper}>
      <Button
        elementType="button"
        variant="text"
        color="black"
        size={isMobile ? 'small' : 'large'}
        onClick={() => onClickActionBtn(BUTTON_ACTION.PREV)}
      >
        <Icon icon="ARROW_LEFT" />
        <span>PREV</span>
      </Button>
      {activeStep === CURRENT_ONBOARDING_PROGRESS_STEP.MATCH_UNSYNCED_PUBS && importPublicationCount}
      <GroupButton variant="text" color="gray">
        {isStepOptional(activeStep) && skipButton}
        <Button
          elementType="button"
          variant="text"
          color="black"
          size={isMobile ? 'small' : 'large'}
          onClick={() => onClickActionBtn(BUTTON_ACTION.NEXT)}
        >
          <span>{activeStep === ONBOARDING_STEPS.length - 1 ? 'DONE' : 'NEXT'}</span>
          <Icon icon="ARROW_RIGHT" />
        </Button>
      </GroupButton>
    </div>
  );
};

export default OnboardingFooter;
