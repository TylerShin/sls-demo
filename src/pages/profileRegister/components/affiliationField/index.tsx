import React, { FC } from 'react';
import { FormikProps, Field } from 'formik';
import classNames from 'classnames';
import { ProfileRegisterFormValues } from '../profileRegisterForm';
import { ProfileAffiliation } from '@src/model/profileAffiliation';
import { Affiliation } from '@src/model/affiliation';
import AffiliationSelectBox from '@src/components/affiliationSelectBox';
import { SuggestAffiliation } from '@src/api/suggest';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../profileRegisterForm/profileRegisterForm.scss');

function formatAffiliation(value?: Affiliation | SuggestAffiliation | string) {
  if (value && (value as Affiliation).name) {
    return (value as Affiliation).name;
  } else if (value && (value as SuggestAffiliation).keyword) {
    return (value as SuggestAffiliation).keyword;
  }
  return value;
}

const AffiliationInputField: FC<{
  formikProps: FormikProps<ProfileRegisterFormValues>;
  profileAffiliation: ProfileAffiliation | null;
}> = props => {
  useStyles(s);
  const { formikProps, profileAffiliation } = props;
  const { values, errors, touched, setFieldValue } = formikProps;

  if (profileAffiliation && (values.affiliation as Affiliation).id !== profileAffiliation.id) {
    const { id, name, nameAbbrev } = profileAffiliation;
    setFieldValue('affiliation', {
      id,
      name,
      nameAbbrev,
    });
  }

  return (
    <div className={s.formRow}>
      <div className={s.formWrapper}>
        <label className={s.formLabel}>Affiliation</label>
        <Field
          name="affiliation"
          component={AffiliationSelectBox}
          placeholder="Affiliation"
          className={classNames({
            [s.inputForm]: true,
            [s.hasError]: !!errors.affiliation && !!touched.affiliation,
          })}
          errorWrapperClassName={s.affiliationErrorMsg}
          format={formatAffiliation}
          disabled
        />
      </div>
    </div>
  );
};

export default AffiliationInputField;
