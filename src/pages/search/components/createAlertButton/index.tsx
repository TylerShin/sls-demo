import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { UserDevice } from '@src/reducers/layout';
import { AppState } from '@src/store/rootReducer';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
import { blockUnverifiedUser, AUTH_LEVEL } from '@src/helpers/checkAuthDialog';
import { openCreateKeywordAlertDialog } from '@src/reducers/createKeywordAlertDialog';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./createAlertButton.scss');

interface AlertCreateButtonProps {
  searchInput?: string;
}

const TooltipBody = React.forwardRef<
  HTMLDivElement,
  AlertCreateButtonProps & {
    isMobile: boolean;
    onClick: () => Promise<void>;
  }
>(({ isMobile, onClick }, ref) => (
  <div ref={ref}>
    <Button
      elementType="button"
      aria-label="Create keyword alert"
      size="small"
      variant="outlined"
      color="blue"
      fullWidth={isMobile}
      disabled={false}
      onClick={onClick}
      style={{
        alignSelf: 'baseline',
        marginTop: '8px',
      }}
    >
      <Icon icon="ALERT" className={s.alertIcon} />
      <span>Create alert</span>
    </Button>
  </div>
));

const AlertCreateButton: React.FC<AlertCreateButtonProps> = props => {
  useStyles(s);
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state: AppState) => ({
    isMobile: state.layout.userDevice === UserDevice.MOBILE,
  }));

  const { searchInput } = props;

  const handleClick = async () => {
    ActionTicketManager.trackTicket({
      pageType: getCurrentPageType(),
      actionType: 'fire',
      actionArea: 'createAlertBtn',
      actionTag: 'clickCreateAlertBtn',
      actionLabel: 'clickCreateAlertBtn',
    });

    const isBlocked = await blockUnverifiedUser({
      authLevel: AUTH_LEVEL.UNVERIFIED,
      actionArea: 'createAlertBtn',
      actionLabel: 'clickCreateAlertBtn',
      userActionType: 'clickCreateAlertBtn',
    });

    if (isBlocked) return;

    dispatch(openCreateKeywordAlertDialog({ from: getCurrentPageType(), keyword: !searchInput ? '' : searchInput }));
  };

  return (
    <Tooltip
      disableFocusListener={true}
      disableTouchListener={true}
      title="📩 We’ll send updated papers for this results via registered email."
      placement={isMobile ? 'bottom' : 'bottom-end'}
      classes={{ tooltip: s.arrowTopTooltip, popper: s.arrowTopTooltipWrapper }}
    >
      <TooltipBody onClick={handleClick} isMobile={isMobile} />
    </Tooltip>
  );
};

export default AlertCreateButton;
