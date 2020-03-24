import React from 'react';
import { withStyles } from '@src/helpers/withStyles';
const styles = require('./hIndexBox.scss');

interface HIndexBoxProps {
  hIndex?: number;
}

class HIndexBox extends React.PureComponent<HIndexBoxProps, {}> {
  public render() {
    if (!this.props.hIndex) {
      return null;
    }

    return <span className={styles.hIndexBox}>{`H-index : ${this.props.hIndex}`}</span>;
  }
}

export default withStyles<typeof HIndexBox>(styles)(HIndexBox);
