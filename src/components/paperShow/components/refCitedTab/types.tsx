import { Dispatch } from 'redux';
import { Paper } from '@src/model/paper';
import { CurrentUser } from '@src/model/currentUser';
import { RefCitedTabItem } from '@src/pages/paperShow/types';

export interface PaperShowRefCitedTabProps {
  paper: Paper;
  isFixed: boolean;
  isOnRef: boolean;
  isOnCited: boolean;
  isOnFullText: boolean;
  isLoading: boolean;
  currentUser: CurrentUser;
  canShowFullPDF: boolean;

  afterDownloadPDF: () => void;
  onClickDownloadPDF: () => void;
  onClickTabItem: (section: RefCitedTabItem) => () => void;
}

export interface TabItemProps {
  active: boolean;
  text: string;
  onClick: () => void;
}

export interface PDFButtonProps {
  dispatch: Dispatch<any>;
  paper: Paper;
  isLoading: boolean;
  canShowFullPDF: boolean;
  actionBtnEl: HTMLDivElement | null;
  currentUser: CurrentUser;
  afterDownloadPDF: () => void;
  onClickDownloadPDF: () => void;
}
