import React from 'react';
import autosize from 'autosize';
import { FieldProps } from 'formik';
import { withStyles } from '@src/helpers/withStyles';
const styles = require('./autoSizeTextarea.scss');

interface ReduxAutoSizeTextareaProps extends React.HTMLProps<HTMLTextAreaElement> {
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  textareaStyle?: React.CSSProperties;
  textareaClassName?: string;
}

@withStyles<typeof ReduxAutoSizeTextarea>(styles)
class ReduxAutoSizeTextarea extends React.PureComponent<ReduxAutoSizeTextareaProps & FieldProps> {
  private textareaDom: HTMLTextAreaElement | null;
  public componentDidUpdate() {
    if (this.textareaDom && this.textareaDom.value.length === 0) {
      autosize.update(this.textareaDom);
    }
  }

  public componentDidMount() {
    if (this.textareaDom) {
      autosize(this.textareaDom);
    }
  }

  public render() {
    const {
      field,
      form,
      textareaClassName,
      wrapperStyle,
      wrapperClassName,
      textareaStyle,
      rows,
      ...textAreaProps
    } = this.props;

    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <textarea
          rows={rows || 1}
          style={textareaStyle}
          className={`form-control ${styles.textarea} ${textareaClassName}`}
          ref={el => (this.textareaDom = el)}
          {...field}
          {...textAreaProps}
        />
      </div>
    );
  }
}

export default ReduxAutoSizeTextarea;
