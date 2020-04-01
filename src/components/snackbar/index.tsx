import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { GLOBAL_SNACKBAR_TYPE, closeSnackbar } from '../../reducers/scinapseSnackbar';
import CollectionSnackBar from './collectionSnackBar';
import CreateKeywordSnackBar from './createKeywordSnackBar';
import { AppState } from '@src/store/rootReducer';

type Props = RouteComponentProps<any>;

const Snackbar: React.FC<Props> = props => {
  const { location } = props;
  const dispatch = useDispatch();
  const { type, isOpen } = useSelector((appState: AppState) => ({
    type: appState.scinapseSnackbarState.type,
    isOpen: appState.scinapseSnackbarState.isOpen,
  }));
  const lastLocation = useRef(location);

  useEffect(() => {
    if (isOpen && lastLocation.current !== location) {
      lastLocation.current = location;
      dispatch(closeSnackbar());
    }
  }, [dispatch, location, isOpen]);

  switch (type) {
    case GLOBAL_SNACKBAR_TYPE.COLLECTION_SAVED:
      return <CollectionSnackBar />;
    case GLOBAL_SNACKBAR_TYPE.CREATE_KEYWORD_ALERT:
      return <CreateKeywordSnackBar />;
    default:
      return <div />;
  }
};

export default withRouter(Snackbar);
