import React from 'react';
import { connect } from 'react-redux';
import { Switch, RouteComponentProps, Route } from 'react-router-dom';
import { CurrentUser } from '@src/model/currentUser';
import SignIn from '@src/components/signIn';
import SignUp from '@src/components/signUp';
import EmailVerification from '@src/components/emailVerification';
import ResetPassword from '@src/components/resetPassword';
import AuthRedirect, { AuthType } from '@src/helpers/authRoute';
import { AppState } from '@src/store/rootReducer';
import { withStyles } from '@src/helpers/withStyles';
const styles = require('./auth.scss');

interface AuthComponentProps extends RouteComponentProps<any> {
  currentUser: CurrentUser;
}

const AuthComponent: React.FunctionComponent<AuthComponentProps> = props => {
  const { match, currentUser } = props;
  const { isLoggedIn } = currentUser;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authWrapper}>
        <Switch>
          <>
            <div className={styles.contentWrapper}>
              <AuthRedirect
                path={`${match.url}/sign_in`}
                component={SignIn}
                isLoggedIn={isLoggedIn}
                needAuthType={AuthType.ShouldLoggedOut}
                exact={true}
              />
              <AuthRedirect
                path={`${match.url}/sign_up`}
                component={SignUp}
                isLoggedIn={isLoggedIn}
                needAuthType={AuthType.ShouldLoggedOut}
                exact={true}
              />
              <Route path={`${match.url}/reset-password`} component={ResetPassword} exact={true} />
              <Route path={`${match.url}/email_verification`} component={EmailVerification} exact={true} />
            </div>
          </>
        </Switch>
      </div>
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    currentUser: state.currentUser,
  };
}

export default connect(mapStateToProps)(withStyles<typeof AuthComponent>(styles)(AuthComponent));
