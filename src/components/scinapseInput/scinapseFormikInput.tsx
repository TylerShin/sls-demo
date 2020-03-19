import React from 'react';
import { FieldProps } from 'formik';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '../icons';
const styles = require('./scinapseInput.scss');

export interface FormikInputBoxProps extends React.HTMLProps<HTMLInputElement> {
  icon?: string;
  iconclassname?: string;
  wrapperStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

class ScinapseFormikInput extends React.PureComponent<FormikInputBoxProps & FieldProps> {
  public render() {
    const { wrapperStyle, inputStyle, field, form, className, ...inputProps } = this.props;
    const { touched, errors } = form;
    const error = errors[field.name];

    return (
      <div className={styles.inputWrapper}>
        <div style={wrapperStyle} className={styles.inputBox}>
          <input {...field} {...inputProps} style={inputStyle} className={className} />
          {this.getIcon()}
        </div>
        {touched && error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  private getIcon() {
    const { icon, iconclassname } = this.props;

    if (icon) {
      return (
        <div className={`${styles.icon} ${iconclassname}`}>
          <Icon icon={icon} />
        </div>
      );
    }
    return null;
  }
}

export default withStyles<typeof ScinapseFormikInput>(styles)(ScinapseFormikInput);
