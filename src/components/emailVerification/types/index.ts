import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { EmailVerificationState } from '../records';
import { GLOBAL_DIALOG_TYPE } from '@src/reducers/globalDialog/types';

export interface EmailVerificationContainerProps extends RouteComponentProps<any> {
  handleChangeDialogType?: (type: GLOBAL_DIALOG_TYPE) => void;
  emailVerificationState: EmailVerificationState;
  dispatch: Dispatch<any>;
}

export interface EmailVerificationParams {
  token?: string;
  email?: string;
}
