import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import { Education } from '@src/model/profileInfo';
import EducationForm, { EducationFormState } from './educationForm';
import PlutoAxios from '@src/api/pluto';
import alertToast from '@src/helpers/makePlutoToastAction';
const styles = require('./authorCVItem.scss');

interface EducationItemState {
  isEditMode: boolean;
  isLoading: boolean;
}

interface EducationItemProps {
  validConnection: boolean;
  profileSlug: string;
  education: Education;
  handleRemoveItem: (cvInfoId: string) => void;
  onUpdate: (cvInfo: EducationFormState) => Promise<void>;
  dispatch: Dispatch<any>;
}

@withStyles<typeof EducationItem>(styles)
class EducationItem extends React.PureComponent<EducationItemProps, EducationItemState> {
  public constructor(props: EducationItemProps) {
    super(props);

    this.state = {
      isEditMode: false,
      isLoading: false,
    };
  }

  public render() {
    const { education } = this.props;
    const { isEditMode, isLoading } = this.state;
    const { id, degree, department, startDate, endDate, isCurrent, institutionName, institutionId } = education;
    return isEditMode ? (
      <EducationForm
        wrapperStyle={{ display: 'inline-flex', position: 'relative' }}
        inputStyle={{
          color: '#666d7c',
          fontSize: '13px',
          lineHeight: '1.54',
          fontFamily: 'Roboto',
          padding: '8px',
        }}
        handleClose={this.handelToggleEducationEditForm}
        isLoading={isLoading}
        handleSubmitForm={this.handelUpdateEducation}
        initialValues={{ id, degree, department, isCurrent, institutionId, institutionName, startDate, endDate }}
        isOpen
      />
    ) : (
      <div className={styles.itemWrapper}>
        <div className={styles.dateSectionWrapper}>
          <span className={styles.dateContent}>
            {startDate} - {endDate ? endDate : 'Present'}
          </span>
        </div>
        <div className={styles.contentWrapper}>
          {this.getEditItemButtons(id)}
          <span className={styles.affiliationContent}>{institutionName}</span>
          <span className={styles.subAffiliationContent}>
            {department}, {degree}
          </span>
        </div>
      </div>
    );
  }

  private getEditItemButtons = (id: string) => {
    const { validConnection, handleRemoveItem } = this.props;

    if (validConnection) {
      return (
        <div className={styles.hoverButtonWrapper}>
          <span className={styles.hoverEditButton} onClick={this.handelToggleEducationEditForm}>
            <Icon icon="PEN" />
          </span>
          <span
            className={styles.hoverDeleteButton}
            onClick={() => {
              handleRemoveItem(id);
            }}
          >
            <Icon icon="X_BUTTON" />
          </span>
        </div>
      );
    }
    return null;
  };

  private handelToggleEducationEditForm = () => {
    const { isEditMode } = this.state;

    this.setState({ isEditMode: !isEditMode });
  };

  private handelUpdateEducation = async (params: EducationFormState) => {
    const { onUpdate } = this.props;
    try {
      this.setState(state => ({ ...state, isLoading: true }));
      await onUpdate({ ...params, endDate: params.isCurrent ? null : params.endDate });
      this.setState(state => ({ ...state, isLoading: false }));
      this.handelToggleEducationEditForm();
    } catch (err) {
      this.setState(state => ({ ...state, isLoading: false }));
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: 'error',
        message: 'Had an error to add education data.',
      });
    }
  };
}

export default connect()(EducationItem);
