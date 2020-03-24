import React from 'react';
import { FACEBOOK_APP_ID } from '@src/constants/auth';
declare var FB: any;

export default function useFBIsLoading() {
  const [FBisLoading, setFBisLoading] = React.useState(true);

  React.useEffect(() => {
    if (FBisLoading) {
      (window as any).fbAsyncInit = function() {
        FB.init({
          appId: FACEBOOK_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v6.0',
        });
        setFBisLoading(false);
      };
    }
  }, []);

  return FBisLoading;
}
