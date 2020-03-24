import React from 'react';
import { Button } from '@pluto_network/pluto-design-elements';
import { useDispatch } from 'react-redux';
import { withStyles } from '@src/helpers/withStyles';
import { setSignUpModalEmail } from '@src/reducers/signUpModal';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';

const s = require('./emailBanner.scss');

const EmailBanner: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = React.useState('');

  const title = 'Tired of searching papers?';
  const subtitle = 'Get recommendations based on your activity.';

  return (
    <div className={s.wrapper}>
      <div className={s.title}>{title}</div>
      <div className={s.subtitle}>{subtitle}</div>
      <img
        loading="lazy"
        className={s.bannerImage}
        src="//assets.scinapse.io/emailBanner.png"
        alt="email banner image"
      />
      <form
        onSubmit={e => {
          e.preventDefault();
          dispatch(setSignUpModalEmail({ email }));
          ActionTicketManager.trackTicket({
            pageType: getCurrentPageType(),
            actionType: 'fire',
            actionTag: 'signUpPopup',
            actionArea: 'signBanner',
            actionLabel: 'recommendEmailBanner',
          });
          GlobalDialogManager.openSignUpDialog({
            authContext: {
              pageType: getCurrentPageType(),
              actionArea: 'signBanner',
              actionLabel: 'recommendEmailBanner',
            },
            userActionType: 'recommendEmailBanner',
            isBlocked: false,
          });
        }}
        className={s.inputWrapper}
      >
        <input
          type="email"
          placeholder="Your email address"
          className={s.emailInput}
          value={email}
          onChange={e => setEmail(e.currentTarget.value)}
          size={15}
          aria-label="Email address input"
        />
        <Button elementType="button" type="submit" aria-label="Scinapse sign up button">
          <span>Sign up</span>
        </Button>
      </form>
    </div>
  );
};

export default withStyles<typeof EmailBanner>(s)(EmailBanner);
