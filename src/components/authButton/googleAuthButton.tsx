import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { OAuthCheckParams } from '@src/api/types/auth';
import Icon from '@src/components/icons';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { DialogState } from '@src/reducers/globalDialog';
import { signInWithSocial, checkOAuthStatus } from '@src/actions/auth';
import { closeDialog } from '@src/actions/globalDialog';
import { AppState } from '@src/store/rootReducer';
import { AppDispatch } from '@src/store';

declare var gapi: any;

interface AuthButtonProps {
  dispatch: AppDispatch;
  dialogState: DialogState;
  isLoading: boolean;
  onSignUpWithSocial: (values: OAuthCheckParams) => void;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = props => {
  const { dispatch, onSignUpWithSocial, dialogState, isLoading } = props;
  const [gapiIsLoading, setGapiIsLoading] = React.useState(typeof gapi === 'undefined');
  const buttonEl = React.useRef<HTMLDivElement | null>(null);
  let auth2: any;

  React.useEffect(() => {
    if (typeof gapi !== 'undefined') {
      setGapiIsLoading(false);
    }
  }, [typeof gapi]);

  React.useEffect(() => {
    if (buttonEl.current && typeof gapi !== 'undefined') {
      gapi.load('auth2', () => {
        auth2 = gapi.auth2.init({
          client_id: '304104926631-429jkjmqj2lgme52067ecm5fk30iqpjr.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
        });
        attachSignIn(buttonEl.current);
      });

      function attachSignIn(element: any) {
        auth2.attachClickHandler(
          element,
          {},
          async (res: any) => {
            const idToken = res.getAuthResponse().id_token;
            const status = await dispatch(checkOAuthStatus('GOOGLE', idToken));

            if (!status) return;

            if (status.isConnected) {
              await dispatch(signInWithSocial('GOOGLE', idToken));
              const authContext = dialogState.authContext;
              if (authContext) {
                let actionLabel: string | null = authContext.expName || authContext.actionLabel;

                if (!actionLabel) {
                  actionLabel = 'topBar';
                }

                ActionTicketManager.trackTicket({
                  pageType: authContext.pageType,
                  actionType: 'fire',
                  actionArea: authContext.actionArea,
                  actionTag: 'signIn',
                  actionLabel,
                  expName: authContext.expName,
                });
              }
              dispatch(closeDialog());
            } else {
              onSignUpWithSocial &&
                onSignUpWithSocial({
                  email: status.email,
                  firstName: status.firstName,
                  lastName: status.lastName,
                  token: idToken,
                  vendor: 'GOOGLE',
                });
            }
          },
          (error: Error) => {
            console.error(`GOOGLE_AUTH_ERROR : ${JSON.stringify(error)}`);
          }
        );
      }
    }
  }, [buttonEl.current, typeof gapi]);

  return (
    <div ref={buttonEl}>
      <Button
        size="large"
        elementType="button"
        aria-label="Google oauth button"
        style={{ backgroundColor: '#dc5240', borderColor: '#dc5240' }}
        disabled={gapiIsLoading}
        isLoading={isLoading}
        fullWidth
      >
        <Icon icon="GOOGLE_LOGO" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    dialogState: state.dialog,
  };
}

export default connect(mapStateToProps)(AuthButton);
