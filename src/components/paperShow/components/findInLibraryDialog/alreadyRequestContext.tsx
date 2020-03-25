import React from 'react';
import Icon from '@src/components/icons';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./findInLibraryDialog.scss');

const AlreadyRequestContext: React.FC<{ count: number; affiliationName: string }> = ({ count, affiliationName }) => {
  useStyles(s);

  return (
    <div className={s.formWrapper}>
      <div className={s.completeWrapper}>
        <Icon icon="SEND" className={s.sendIcon} />
        <div className={s.title}>IN PROGRESS</div>
        <div className={s.subTitle}>
          You have already submitted a request to your institution to link with Scinapse.
          <br />
          We will notify you when it’s complete.
          <div className={s.contentDivider} />
          There are currently <b className={s.highLightContext}>{count}</b> requests
          <br /> for <span className={s.highLightAffiliationName}>{affiliationName}</span>.
        </div>
      </div>
    </div>
  );
};

export default AlreadyRequestContext;
