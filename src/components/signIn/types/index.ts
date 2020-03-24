import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { OAUTH_VENDOR } from '@src/api/types/auth';
import { GLOBAL_DIALOG_TYPE } from '@src/reducers/globalDialog/types';

export interface SignInContainerProps extends RouteComponentProps<any> {
  dispatch: Dispatch<any>;
  handleChangeDialogType?: (type: GLOBAL_DIALOG_TYPE) => void;
}

export interface SignInSearchParams {
  code?: string;
  vendor?: OAUTH_VENDOR;
}
