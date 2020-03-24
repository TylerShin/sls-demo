import { CURRENT_ONBOARDING_PROGRESS_STEP, ONBOARDING_STEPS } from '@src/types/profile';

export const isStepOptional = (step: CURRENT_ONBOARDING_PROGRESS_STEP) => {
  return (
    step === CURRENT_ONBOARDING_PROGRESS_STEP.MATCH_UNSYNCED_PUBS ||
    step === CURRENT_ONBOARDING_PROGRESS_STEP.SELECT_REPRESENTATIVE_PUBS
  );
};

export const isStepFinal = (step: CURRENT_ONBOARDING_PROGRESS_STEP) => {
  return step === ONBOARDING_STEPS.length;
};
