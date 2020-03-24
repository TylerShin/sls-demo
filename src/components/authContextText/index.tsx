import React from 'react';
import { withStyles } from '@src/helpers/withStyles';
import { positiveSignUpContext } from './constants';
import { ActionTagType } from '@src/constants/actionTicket';
const styles = require('./authContextText.scss');

interface AuthContextTextProps {
  userActionType?: ActionTagType;
}

export const ContextText: React.FunctionComponent<{
  subText: string;
}> = React.memo(props => {
  const { subText } = props;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <span className={styles.contentText}>{subText}</span>
      </div>
    </div>
  );
});

const AuthContextText: React.FunctionComponent<AuthContextTextProps> = props => {
  const { userActionType } = props;
  if (!userActionType) {
    return null;
  }

  const subText = positiveSignUpContext[userActionType];

  if (!subText) {
    return null;
  }

  return <ContextText subText={subText} />;
};

export default withStyles<typeof AuthContextText>(styles)(AuthContextText);
