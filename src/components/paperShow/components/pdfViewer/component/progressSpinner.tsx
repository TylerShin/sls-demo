import React from 'react';
import { useIntervalProgress } from '@src/hooks/useIntervalProgressHook';
import { withStyles } from '@src/helpers/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
const styles = require('../pdfViewer.scss');

const ProgressSpinner: React.FC<any> = () => {
  const [percent, setPercent] = React.useState(0);

  useIntervalProgress(
    () => {
      setPercent(percent + 10);
    },
    percent < 90 ? 750 : null
  );

  return (
    <div className={styles.loadingContainerWrapper}>
      <div className={styles.loadingContainer}>
        <CircularProgress size={100} thickness={2} color="inherit" variant="static" value={percent} />
        <span className={styles.loadingContent}>{`${percent}%`}</span>
      </div>
    </div>
  );
};

export default withStyles<typeof ProgressSpinner>(styles)(ProgressSpinner);
