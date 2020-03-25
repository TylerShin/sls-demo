import React from 'react';
import Icon from '@src/components/icons';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./findInLibraryDialog.scss');

const SuccessRequestContext: React.FC<{ count: number; affiliationName: string }> = ({ count, affiliationName }) => {
  useStyles(s);

  return (
    <div className={s.formWrapper}>
      <div className={s.completeWrapper}>
        <Icon icon="COMPLETE" className={s.completeIcon} />
        <div className={s.title}>SUCCESS</div>
        <div className={s.subTitle}>
          Thank you.
          <br />
          We will notify you when the paper is available through your institution
          <div className={s.contentDivider} />
          There are currently <b className={s.highLightContext}>{count}</b> requests
          <br /> for <span className={s.highLightAffiliationName}>{affiliationName}</span>.
        </div>
      </div>
    </div>
  );
};

export default SuccessRequestContext;
