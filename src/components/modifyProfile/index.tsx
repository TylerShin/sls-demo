import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Button } from '@pluto_network/pluto-design-elements';
import { Formik, Form, Field, FormikErrors } from 'formik';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import AffiliationSelectBox from '@src/components/affiliationSelectBox';
import { Affiliation } from '@src/model/affiliation';
import { SuggestAffiliation } from '@src/api/suggest';
import validateEmail from '@src/helpers/validateEmail';
import scinapseFormikCheckbox from '@src/components/scinapseInput/scinapseFormikCheckbox';
import FormikInput from '@src/components/formikInput';
const styles = require('./modifyProfile.scss');

export interface ModifyProfileFormState {
  firstName: string;
  lastName: string;
  currentAffiliation: Affiliation | SuggestAffiliation | string;
  bio: string | null;
  email: string;
  website: string | null;
  hideEmail: boolean;
}

interface ModifyProfileProps {
  isOpen: boolean;
  isLoading: boolean;
  initialValues: ModifyProfileFormState;
  handleSubmitForm: (profile: ModifyProfileFormState) => Promise<void>;
  handleClose: React.ReactEventHandler<{}>;
}

const validateForm = (values: ModifyProfileFormState) => {
  const errors: FormikErrors<ModifyProfileFormState> = {};

  if (!validateEmail(values.email)) {
    errors.email = 'Please enter valid e-mail address.';
  }

  if (
    !(values.currentAffiliation as Affiliation).name &&
    !(values.currentAffiliation as SuggestAffiliation).keyword &&
    !values.currentAffiliation
  ) {
    errors.currentAffiliation = 'Not available affiliation';
  }

  if (!values.firstName && values.firstName.length < 2) {
    errors.firstName = 'Minimum length is 1';
  }

  if (!values.lastName && values.lastName.length < 2) {
    errors.lastName = 'Minimum length is 1';
  }

  if (
    !!values.website &&
    values.website.length > 0 &&
    !values.website.includes('http://') &&
    !values.website.includes('https://')
  ) {
    errors.website = "Website URL should start with 'http://' or 'https://'";
  }

  return errors;
};

@withStyles<typeof ModifyProfileDialog>(styles)
class ModifyProfileDialog extends React.PureComponent<ModifyProfileProps> {
  private formikNode: Formik<ModifyProfileFormState> | null;

  public componentDidUpdate(prevProps: ModifyProfileProps) {
    if (prevProps.isOpen && !this.props.isOpen && this.formikNode) {
      this.formikNode.resetForm();
    }
  }

  public render() {
    const { isOpen, handleClose, isLoading, handleSubmitForm, initialValues } = this.props;

    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        classes={{
          paper: styles.dialogPaper,
        }}
      >
        <div className={styles.dialogHeader}>
          <div className={styles.mainTitle}>Edit author information</div>
          <div className={styles.closeButton} onClick={handleClose}>
            <Icon className={styles.closeIcon} icon="X_BUTTON" />
          </div>
          <div className={styles.subtitle}>You can edit the Author information that will be shown to other users.</div>
        </div>
        <Formik
          ref={(el: any) => (this.formikNode = el)}
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
          validate={validateForm}
          enableReinitialize
          render={({ errors }) => {
            return (
              <Form>
                <div className={styles.contentSection}>
                  <div className={styles.formControl}>
                    <div className={styles.inlineInput}>
                      <label htmlFor="firstName">First Name</label>
                      <Field
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        component={FormikInput}
                        error={errors.firstName}
                      />
                    </div>
                    <div className={styles.inlineInput}>
                      <label htmlFor="lastName">Last Name</label>
                      <Field
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        component={FormikInput}
                        error={errors.lastName}
                      />
                    </div>
                  </div>
                  <div className={styles.inlineInput} style={{ width: '100%', margin: '24px 0' }}>
                    <label htmlFor="currentAffiliation">Current Affiliation</label>
                    <Field
                      name="currentAffiliation"
                      component={AffiliationSelectBox}
                      className={styles.inputForm}
                      format={this.formatAffiliation}
                      disabled={true}
                    />
                  </div>
                  <div className={styles.bioWrapper}>
                    <label htmlFor="bio">
                      Short Bio<small> (Optional)</small>
                    </label>
                    <Field
                      name="bio"
                      component={FormikInput}
                      disabled={isLoading}
                      placeholder="Please tell us about yourself."
                      multiline={true}
                    />
                  </div>
                  <div className={styles.formControl}>
                    <div className={styles.inlineInput}>
                      <label htmlFor="email">Email Address</label>
                      <Field
                        component={FormikInput}
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        disabled={true}
                      />

                      <div className={styles.checkboxField}>
                        <Field
                          className={styles.checkBox}
                          component={scinapseFormikCheckbox}
                          name="hideEmail"
                          type="checkbox"
                          checked={initialValues.hideEmail}
                        />
                        <span className={styles.checkboxInfo}>Hide email from other users</span>
                      </div>
                    </div>
                    <div className={styles.inlineInput}>
                      <label htmlFor="website">
                        Website URL<small> (Optional)</small>
                      </label>
                      <Field
                        component={FormikInput}
                        name="website"
                        type="text"
                        placeholder="e.g. https://username.com"
                        error={errors.website}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.footer}>
                  <div className={styles.buttonsWrapper}>
                    <Button elementType="button" type="submit" disabled={isLoading} isLoading={isLoading}>
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </div>
              </Form>
            );
          }}
        />
      </Dialog>
    );
  }

  private formatAffiliation = (value?: Affiliation | SuggestAffiliation | string) => {
    if (value && (value as Affiliation).name) {
      return (value as Affiliation).name;
    } else if (value && (value as SuggestAffiliation).keyword) {
      return (value as SuggestAffiliation).keyword;
    }
    return value;
  };
}

export default ModifyProfileDialog;
