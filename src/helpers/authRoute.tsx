import React from 'react';
import { RouteProps, Redirect, Route } from 'react-router-dom';
import alertToast from './makePlutoToastAction';

export enum AuthType {
  ShouldLoggedIn,
  ShouldLoggedOut,
}

interface AuthRouteParam {
  isLoggedIn: boolean;
  needAuthType: AuthType;
}

const AuthRoute: React.FunctionComponent<AuthRouteParam & RouteProps> = props => {
  const { path, component, isLoggedIn, needAuthType } = props;

  let redirectPath;
  let notificationMessage;
  if (needAuthType === AuthType.ShouldLoggedIn) {
    redirectPath = '/users/sign_in';
    notificationMessage = 'You need to login first!';
  } else if (needAuthType === AuthType.ShouldLoggedOut) {
    redirectPath = '/';
    notificationMessage = 'You already logged in!';
  }

  const forbiddenAccess =
    (isLoggedIn && needAuthType === AuthType.ShouldLoggedOut) ||
    (!isLoggedIn && needAuthType === AuthType.ShouldLoggedIn);
  const isComponent = !!component;

  if (forbiddenAccess) {
    alertToast({
      type: 'error',
      message: notificationMessage || '',
    });

    return (
      <Redirect
        to={{
          pathname: redirectPath,
        }}
      />
    );
  } else if (isComponent) {
    return <Route path={path} component={component} exact={true} />;
  } else {
    return null;
  }
};

export default AuthRoute;
