import React from 'react';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';
import { Button } from '@pluto_network/pluto-design-elements';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./scinapseSnackbar.scss');

type Props = SnackbarProps & {
  openFrom: string;
};

const ScinapseSnackbar: React.FC<Props> = props => {
  useStyles(s);
  const { open, openFrom, onClose, message, action } = props;

  if (!onClose) return null;

  return (
    <Snackbar
      classes={{ root: s.snackbarWrapper }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={open}
      onClose={onClose}
      autoHideDuration={5000}
      ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={message}
      action={[
        action,
        <div className={s.closeBtn} key={`close`}>
          <Button
            elementType="button"
            aria-label="Close scinapse snackbar button"
            variant="text"
            color="gray"
            size="small"
            onClick={e => {
              ActionTicketManager.trackTicket({
                pageType: getCurrentPageType(),
                actionType: 'fire',
                actionArea: openFrom,
                actionTag: 'clickCloseButton',
                actionLabel: null,
              });
              onClose(e, '');
            }}
          >
            <Icon icon="X_BUTTON" />
          </Button>
        </div>,
      ]}
    />
  );
};

export default ScinapseSnackbar;
