import React from 'react';
import { connect } from 'react-redux';
import { Formik, Form, Field, FormikErrors } from 'formik';
import { Button } from '@pluto_network/pluto-design-elements';
import { withStyles } from '@src/helpers/withStyles';
import AuthInputBox from '@src/components/authInput';
import DashedDividerWithContent from '@src/components/separator';
import AuthTabs from '../../../authTabs';
import validateEmail from '@src/helpers/validateEmail';
import AuthGuideContext from '@src/components/authGuideContext';
import AuthContextText from '@src/components/authContextText';
import { signInWithSocial, signInWithEmail } from '@src/actions/auth';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import AuthButtons from '../../../authButton/authButtons';
import { ActionTagType } from '@src/constants/actionTicket';
import { OAUTH_VENDOR, MINIMUM_PASSWORD_LENGTH } from '@src/constants/auth';
import { GLOBAL_DIALOG_TYPE } from '@src/reducers/globalDialog/types';
import { DialogState } from '@src/reducers/globalDialog';
import { checkOAuthStatus, checkDuplicatedEmail } from '@src/actions/auth';
import { AppState } from '@src/store/rootReducer';
import { closeDialog } from '@src/actions/globalDialog';
import { getCollections } from '@src/actions/collections';
import { AppDispatch } from '@src/store';
const s = require('./firstForm.scss');

declare var FB: any;

interface FirstFormProps {
  initialEmail: string;
  onSubmit: (values: FormValues) => void;
  onClickTab: (type: GLOBAL_DIALOG_TYPE) => void;
  userActionType: ActionTagType | undefined;
  onSignUpWithSocial: (values: {
    email?: string | null;
    firstName: string;
    lastName: string;
    token: string;
    vendor: OAUTH_VENDOR;
  }) => void;
  dialogState: DialogState;
  dispatch: AppDispatch;
}

interface FormValues {
  email: string;
  password: string;
}

export const oAuthBtnBaseStyle: React.CSSProperties = { position: 'relative', fontSize: '13px', marginTop: '10px' };

const FirstForm: React.FunctionComponent<FirstFormProps> = props => {
  const { dispatch, dialogState, initialEmail } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const [networkError, setNetworkError] = React.useState('');

  async function onSubmit(values: FormValues) {
    const { email, password } = values;
    const duplicatedEmail = await checkDuplicatedEmail(email);

    if (!duplicatedEmail) return props.onSubmit(values);

    try {
      setIsLoading(true);
      const res = await props.dispatch(signInWithEmail({ email, password }, true));
      const authContext = props.dialogState.authContext;
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

      if (res && res.member) {
        await props.dispatch(getCollections(res.member.id));
      }
      setIsLoading(false);

      props.dispatch(closeDialog());
    } catch (err) {
      setIsLoading(false);
      setNetworkError('Your already sign up. Please checked password.');
    }
  }

  function handleClickFBLogin() {
    FB.login(
      async (res: any) => {
        if (res.authResponse) {
          const accessToken = res.authResponse.accessToken;
          const status = await dispatch(checkOAuthStatus('FACEBOOK', accessToken));

          if (!status) return;

          if (status.isConnected) {
            await dispatch(signInWithSocial('FACEBOOK', accessToken));
            const authContext = dialogState.authContext;
            if (authContext) {
              ActionTicketManager.trackTicket({
                pageType: authContext.pageType,
                actionType: 'fire',
                actionArea: authContext.actionArea,
                actionTag: 'signIn',
                actionLabel: authContext.actionLabel,
                expName: authContext.expName,
              });
            }
            dispatch(closeDialog());
          } else {
            props.onSignUpWithSocial({
              email: status.email,
              firstName: status.firstName,
              lastName: status.lastName,
              token: accessToken,
              vendor: 'FACEBOOK',
            });
          }
        }
      },
      {
        scope: 'public_profile,email',
      }
    );
  }

  const validateForm = async (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    const { email, password } = values;

    if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      errors.password = 'Must have at least 8 characters!';
    }

    if (Object.keys(errors).length) {
      throw errors;
    }
  };

  return (
    <>
      <AuthContextText userActionType={props.userActionType} />
      <div className={s.authContainer}>
        <AuthGuideContext userActionType={props.userActionType} />
        <div className={s.authFormWrapper}>
          <AuthTabs onClickTab={props.onClickTab} activeTab={'sign up'} />
          <div className={s.formWrapper}>
            <Formik
              initialValues={{ email: initialEmail, password: '' }}
              onSubmit={onSubmit}
              validate={validateForm}
              render={() => {
                return (
                  <Form>
                    <Field
                      name="email"
                      type="email"
                      component={AuthInputBox}
                      autoFocus={!props.initialEmail}
                      placeholder="E-mail"
                      iconName="EMAIL"
                    />
                    <Field
                      name="password"
                      type="password"
                      component={AuthInputBox}
                      placeholder="Password"
                      iconName="PASSWORD"
                      autoFocus={!!props.initialEmail}
                    />
                    {networkError && <div className={s.errorContent}>{networkError}</div>}
                    <div className={s.authButtonWrapper}>
                      <Button
                        type="submit"
                        elementType="button"
                        aria-label="Scinapse sign up button"
                        isLoading={isLoading}
                        fullWidth
                        size="large"
                      >
                        <span>Sign up</span>
                      </Button>
                    </div>
                  </Form>
                );
              }}
            />
            <DashedDividerWithContent wrapperClassName={s.dashSeparatorBox} content="OR" />
            <AuthButtons
              handleClickFBLogin={handleClickFBLogin}
              handleClickGoogleLogin={props.onSignUpWithSocial}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

function mapStateToProps(state: AppState) {
  return {
    dialogState: state.dialog,
  };
}
export default connect(mapStateToProps)(withStyles<typeof FirstForm>(s)(FirstForm));
