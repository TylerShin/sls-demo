import React from 'react';
import NoSsr from '@material-ui/core/NoSsr';
import { Button } from '@pluto_network/pluto-design-elements';
import { withStyles } from '@src/helpers/withStyles';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import { ActionTicketParams } from '@src/helpers/actionTicketManager/actionTicket';
import { useObserver } from '@src/hooks/useIntersectionHook';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { CurrentUser } from '@src/model/currentUser';
import Icon from '@src/components/icons';
const styles = require('./bottomBanner.scss');

interface BottomBannerProps {
  currentUser: CurrentUser;
}

function handleOpenSignModal(modalType: 'signUpPopup' | 'signInPopup') {
  switch (modalType) {
    case 'signInPopup':
      GlobalDialogManager.openSignInDialog({
        authContext: {
          pageType: 'paperShow',
          actionArea: 'signBanner',
          actionLabel: 'bottomBanner',
        },
        isBlocked: false,
      });

      break;
    case 'signUpPopup':
      GlobalDialogManager.openSignUpDialog({
        authContext: {
          pageType: 'paperShow',
          actionArea: 'signBanner',
          actionLabel: 'bottomBanner',
        },
        isBlocked: false,
      });

      break;
  }

  ActionTicketManager.trackTicket({
    pageType: 'paperShow',
    actionType: 'fire',
    actionArea: 'signBanner',
    actionLabel: 'bottomBanner',
    actionTag: modalType,
  });
}

const BottomBanner: React.FC<BottomBannerProps> = ({ currentUser }) => {
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    setShouldShow(!currentUser.isLoggedIn && !currentUser.isLoggingIn);
  }, [currentUser]);

  const bannerViewTicketContext: ActionTicketParams = {
    pageType: 'paperShow',
    actionType: 'view',
    actionArea: 'signBanner',
    actionTag: 'bannerView',
    actionLabel: 'bottomBanner',
  };
  const { elRef } = useObserver(0.8, bannerViewTicketContext);

  if (!shouldShow) {
    return null;
  }

  return (
    <NoSsr>
      <div className={styles.bannerContainer} ref={elRef}>
        <div className={styles.bannerWrapper}>
          <div className={styles.contextWrapper}>
            <div className={styles.titleContext}>PREVIEW OF SCINAPSE</div>
            <div className={styles.mainContext}>
              Sign up to get unlimited search results and papers. It's free and always will be.
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <button className={styles.subContext} onClick={() => handleOpenSignModal('signInPopup')}>
              Already have an account?
            </button>
            <Button
              elementType="button"
              aria-label="Scinapse sign up button"
              size="large"
              onClick={() => handleOpenSignModal('signUpPopup')}
              style={{ paddingLeft: '16px', paddingRight: '16px' }}
            >
              <span>Sign Up</span>
            </Button>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={() => setShouldShow(false)}>
          <Icon icon="X_BUTTON" />
        </button>
      </div>
    </NoSsr>
  );
};

export default withStyles<typeof BottomBanner>(styles)(BottomBanner);
