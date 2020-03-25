import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@src/helpers/withStyles';
import PaperShowCollectionControlButton from './components/paperShowCollectionControlButton';
import CiteBox from './components/citeBox';
import { Paper } from '@src/model/paper';
import { CurrentUser } from '@src/model/currentUser';
import SourceButton from './components/sourceButton';
import ViewFullTextBtn from './components/viewFullTextBtn';
import FindInLibraryBtn from './components/findInLibraryBtn';
import { openFindInLibraryDialog } from '@src/reducers/findInLibraryDialog';
const s = require('./actionBar.scss');

interface PaperShowActionBarProps {
  paper: Paper;
  dispatch: Dispatch<any>;
  hasPDFFullText: boolean;
  isLoadingPDF: boolean;
  currentUser: CurrentUser;
  handleClickFullText: () => void;
}

const PaperShowActionBar: React.FC<PaperShowActionBarProps> = props => {
  const findInLibraryBtnEl = React.useRef<HTMLDivElement | null>(null);

  const requestButton = (
    <div className={s.actionItem} ref={findInLibraryBtnEl}>
      <FindInLibraryBtn
        actionArea="paperDescription"
        isLoading={props.isLoadingPDF}
        paper={props.paper}
        onClick={() => props.dispatch(openFindInLibraryDialog())}
      />
    </div>
  );

  return (
    <div className={s.actionBar}>
      <div className={s.actions}>
        <div className={s.leftSide}>
          {!props.hasPDFFullText ? (
            requestButton
          ) : (
            <div className={s.actionItem}>
              <ViewFullTextBtn
                paperId={props.paper.id}
                handleClickFullText={props.handleClickFullText}
                isLoading={props.isLoadingPDF}
              />
            </div>
          )}
          {props.paper.bestPdf && (
            <div className={s.actionItem}>
              <SourceButton paper={props.paper} showFullText={props.paper.bestPdf.hasBest} />
            </div>
          )}
          <div className={s.actionItem}>
            <CiteBox actionArea="paperDescription" paper={props.paper} />
          </div>
        </div>
        <div className={s.rightSide}>
          <PaperShowCollectionControlButton paperId={props.paper.id} />
        </div>
      </div>
    </div>
  );
};

export default connect()(withStyles<typeof PaperShowActionBar>(s)(PaperShowActionBar));
