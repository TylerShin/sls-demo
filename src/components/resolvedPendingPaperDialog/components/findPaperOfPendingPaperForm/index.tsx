import React, { FC, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, FormikErrors } from 'formik';
import { Button } from '@pluto_network/pluto-design-elements';
import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import { getPaper } from '@src/actions/paperShow';
import NonLinkablePaperItem from '@src/components/paperItem/nonLinkablePaperItem';
import FormikInput from '@src/components/scinapseInput/scinapseFormikInput';
import Icon from '@src/components/icons';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./findPaperOfPendingPaperForm.scss');

const SCINAPSE_PAPER_SHOW_PREFIX = 'https://scinapse.io/papers/';

interface FindPaperOfPendingPaperFormProps {
  recommendedPaperId?: string;
  onClickNextBtn: (targetPaperId: string | null) => void;
  onCloseDialog: () => void;
}

interface FoundPaperItemProps {
  paperId?: string;
  isLoading: boolean;
  isChecked: boolean;
}

interface FormState {
  targetResolvedPaperId: string;
  searchPaperUrl: string;
}

function validateForm(values: FormState) {
  const errors: FormikErrors<FormState> = {};

  if (values.searchPaperUrl.length > 0 && !values.searchPaperUrl.includes(SCINAPSE_PAPER_SHOW_PREFIX)) {
    errors.searchPaperUrl = 'Please enter valid scinapse paper url.';
  }
  return errors;
}

const FoundPaperItem: FC<FoundPaperItemProps> = ({ isLoading, paperId, isChecked }) => {
  if (isLoading)
    return (
      <div className={s.spinnerWrapper}>
        <CircularProgress className={s.loadingSpinner} disableShrink={true} size={20} thickness={4} />
      </div>
    );

  if (!paperId) return <span className={s.guideText}>Could not find a similar article.</span>;

  return (
    <>
      <Radio name="targetResolvedPaperId" value={paperId} checked={isChecked} color="default" readOnly />
      <NonLinkablePaperItem paperId={paperId} />
    </>
  );
};

const FindPaperOfPendingPaperForm: FC<FindPaperOfPendingPaperFormProps> = ({
  recommendedPaperId,
  onClickNextBtn,
  onCloseDialog,
}) => {
  useStyles(s);
  const dispatch = useDispatch();

  const [searchPaperId, setSearchPaperId] = useState<string>('');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isRecPaperLoading, setIsRecPaperLoading] = useState<boolean>(false);

  const searchPaper = useCallback(
    async (paperUrl: string) => {
      const targetPaperId = paperUrl.split(SCINAPSE_PAPER_SHOW_PREFIX)[1];

      if (!targetPaperId) return;

      setIsSearchLoading(true);

      try {
        await dispatch(getPaper({ paperId: targetPaperId }));
        setIsSearchLoading(false);
        setSearchPaperId(targetPaperId);
      } catch (err) {
        console.error(err);
        setIsSearchLoading(false);
        setSearchPaperId('');
      }
    },
    [dispatch]
  );

  const onSubmitFindPaperForm = (values: FormState) => {
    onClickNextBtn(values.targetResolvedPaperId);
  };

  useEffect(() => {
    if (!recommendedPaperId) return;

    const fetchRecommendedPaper = async () => {
      setIsRecPaperLoading(true);

      try {
        await dispatch(getPaper({ paperId: recommendedPaperId }));
        setIsRecPaperLoading(false);
      } catch (err) {
        console.error(err);
        setIsRecPaperLoading(false);
      }
    };

    fetchRecommendedPaper();
  }, [dispatch, recommendedPaperId]);

  return (
    <div>
      <Formik
        initialValues={{ targetResolvedPaperId: '', searchPaperUrl: '' }}
        onSubmit={onSubmitFindPaperForm}
        enableReinitialize
        validate={validateForm}
        render={({ values, errors, setFieldValue }) => (
          <Form>
            <div
              className={s.recommendedPaperItemWrapper}
              onClick={() => setFieldValue('targetResolvedPaperId', recommendedPaperId)}
            >
              <FoundPaperItem
                isLoading={isRecPaperLoading}
                paperId={recommendedPaperId}
                isChecked={values.targetResolvedPaperId === recommendedPaperId}
              />
            </div>
            <div className={s.contentDivider} />
            <div className={s.searchPaperContainer}>
              <div className={s.searchInputWrapper}>
                <Field
                  name="searchPaperUrl"
                  type="text"
                  placeholder="ex) https://scinapse.io/papers/1231234"
                  component={FormikInput}
                  error={errors.searchPaperUrl}
                  onBlur={() => searchPaper(values.searchPaperUrl)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchPaper(values.searchPaperUrl);
                    }
                  }}
                  disabled={isSearchLoading}
                />
                <Button
                  elementType="button"
                  type="button"
                  color="gray"
                  variant="contained"
                  className={s.searchButton}
                  onClick={() => searchPaper(values.searchPaperUrl)}
                  isLoading={isSearchLoading}
                >
                  <Icon icon="SEARCH" />
                </Button>
              </div>
              {searchPaperId && (
                <div
                  className={s.recommendedPaperItemWrapper}
                  onClick={() => setFieldValue('targetResolvedPaperId', searchPaperId)}
                >
                  <FoundPaperItem
                    isLoading={isSearchLoading}
                    paperId={searchPaperId}
                    isChecked={values.targetResolvedPaperId === searchPaperId}
                  />
                </div>
              )}
            </div>
            <div className={s.contentDivider} />
            <div className={s.noContentOptionWrapper} onClick={() => setFieldValue('targetResolvedPaperId', null)}>
              <Radio checked={!values.targetResolvedPaperId} name="targetResolvedPaperId" color="default" readOnly />
              <span>I couldn't find my paper.</span>
            </div>
            <div className={s.footerButtonWrapper}>
              <Button elementType="button" color="black" variant="text" onClick={onCloseDialog} type="button">
                <span>CANCEL</span>
              </Button>
              <Button elementType="button" color="black" variant="contained" type="submit">
                <span>NEXT</span>
              </Button>
            </div>
          </Form>
        )}
      />
    </div>
  );
};

export default FindPaperOfPendingPaperForm;
