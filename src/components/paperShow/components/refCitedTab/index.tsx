import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@src/helpers/withStyles';
import { PDFButtonProps, TabItemProps, PaperShowRefCitedTabProps } from './types';
import CollectionButton from '@src/components/paperItem/components/collectionButton';
import CiteBox from '../paperShowActionBar/components/citeBox';
import PdfDownloadButton from '../pdfDownloadButton';
const styles = require('./refCitedTab.scss');

const TabItem: React.FunctionComponent<TabItemProps> = props => {
  return (
    <li
      className={classNames({
        [styles.headerTabItem]: true,
        [styles.active]: props.active,
      })}
      onClick={props.onClick}
    >
      {props.text}
    </li>
  );
};

const PDFButton: React.FunctionComponent<PDFButtonProps> = props => {
  const { paper, isLoading, canShowFullPDF, onClickDownloadPDF, afterDownloadPDF } = props;

  if (canShowFullPDF) {
    return (
      <>
        <PdfDownloadButton
          actionArea="contentNavBar"
          paper={paper}
          isLoading={isLoading}
          onDownloadedPDF={onClickDownloadPDF!}
          handleSetScrollAfterDownload={afterDownloadPDF}
        />
      </>
    );
  }
  return (
    <CollectionButton
      pageType="paperShow"
      actionArea="contentNavBar"
      paper={paper}
      saved={!!paper.relation && paper.relation.savedInCollections.length > 0}
      buttonStyle={{ height: '40px', backgroundColor: '#3e7fff', border: '1px solid #3e7fff', fontWeight: 500 }}
    />
  );
};

const PDFButtonWithDialog = connect()(PDFButton);

const PaperShowRefCitedTab: React.FC<PaperShowRefCitedTabProps> = React.memo(props => {
  let fullTextNode;
  const actionBtnEl = React.useRef<HTMLDivElement | null>(null);

  if (props.canShowFullPDF) {
    fullTextNode = <TabItem active={!!props.isOnFullText} onClick={props.onClickTabItem('fullText')} text="Paper" />;
  }

  return (
    <div
      className={classNames({
        [styles.paperContentBlockHeaderTabs]: !props.isFixed,
        [`${styles.paperContentBlockHeaderTabs} ${styles.stick} mui-fixed`]: props.isFixed,
      })}
    >
      <div className={styles.paperContentBlockHeaderTabContentWrapper}>
        <ul className={styles.headerTabList}>
          {fullTextNode}
          <TabItem
            active={props.isOnRef}
            onClick={props.onClickTabItem('ref')}
            text={`References (${props.paper.referenceCount})`}
          />
          <TabItem
            active={props.isOnCited}
            onClick={props.onClickTabItem('cited')}
            text={`Citations (${props.paper.citedCount})`}
          />
        </ul>
        <div className={styles.rightBtnBox}>
          <div className={styles.actionItem}>
            <CiteBox actionArea="contentNavBar" paper={props.paper} />
          </div>
          <div className={styles.actionItem} ref={actionBtnEl}>
            <PDFButtonWithDialog
              currentUser={props.currentUser}
              paper={props.paper}
              isLoading={props.isLoading}
              canShowFullPDF={props.canShowFullPDF}
              actionBtnEl={actionBtnEl.current}
              onClickDownloadPDF={props.onClickDownloadPDF!}
              afterDownloadPDF={props.afterDownloadPDF!}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default withStyles<typeof PaperShowRefCitedTab>(styles)(PaperShowRefCitedTab);
