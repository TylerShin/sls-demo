import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Icon from '@src/components/icons';
import PlutoAxios from '@src/api/pluto';
import { Award } from '@src/model/profileInfo';
import AwardForm, { AwardFormState } from './awardForm';
import alertToast from '@src/helpers/makePlutoToastAction';
import { withStyles } from '@src/helpers/withStyles';
const styles = require('./authorCVItem.scss');

interface AwardItemState {
  isEditMode: boolean;
  isLoading: boolean;
}

interface AwardItemProps {
  validConnection: boolean;
  profileSlug: string;
  award: Award;
  handleRemoveItem: (cvInfoId: string) => void;
  onUpdate: (cvInfo: AwardFormState) => Promise<void>;
  dispatch: Dispatch<any>;
}

@withStyles<typeof AwardItem>(styles)
class AwardItem extends React.PureComponent<AwardItemProps, AwardItemState> {
  public constructor(props: AwardItemProps) {
    super(props);

    this.state = {
      isEditMode: false,
      isLoading: false,
    };
  }

  public render() {
    const { award } = this.props;
    const { isEditMode, isLoading } = this.state;
    const { id, title, receivedDate, relatedLink } = award;
    return isEditMode ? (
      <AwardForm
        handleClose={this.handelToggleAwardEditForm}
        isOpen={isEditMode}
        handleSubmitForm={this.handelUpdateAward}
        isLoading={isLoading}
        initialValues={{
          id,
          title,
          receivedDate,
          relatedLink,
        }}
      />
    ) : (
      <div className={styles.itemWrapper}>
        <div className={styles.dateSectionWrapper}>
          <span className={styles.dateContent}>{receivedDate}</span>
        </div>
        <div className={styles.contentWrapper}>
          {this.getEditItemButtons(id)}
          <span className={styles.awardTitleContent}>{title}</span>
          <a rel="nofollow" className={styles.relatedLinkContent} href={relatedLink ? relatedLink : ''}>
            {relatedLink}
          </a>
        </div>
      </div>
    );
  }

  private getEditItemButtons = (id: string) => {
    const { validConnection, handleRemoveItem } = this.props;

    if (validConnection) {
      return (
        <div className={styles.hoverButtonWrapper}>
          <span className={styles.hoverEditButton} onClick={this.handelToggleAwardEditForm}>
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

  private handelToggleAwardEditForm = () => {
    const { isEditMode } = this.state;

    this.setState({ isEditMode: !isEditMode });
  };

  private handelUpdateAward = async (params: AwardFormState) => {
    const { onUpdate } = this.props;
    try {
      this.setState(state => ({ ...state, isLoading: true }));
      await onUpdate(params);
      this.setState(state => ({ ...state, isLoading: false }));
      this.handelToggleAwardEditForm();
    } catch (err) {
      this.setState(state => ({ ...state, isLoading: false }));
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: 'error',
        message: 'Had an error to add award data.',
      });
    }
  };
}

export default connect()(AwardItem);
