import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@src/helpers/withStyles';
import copySelectedTextToClipboard from '@src/helpers/copySelectedTextToClipboard';
import { trackEvent } from '@src/helpers/handleGA';
import Icon from '@src/components/icons';
import { exportCitationText } from '@src/helpers/exportCitationText';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { AvailableCitationType, AvailableExportCitationType } from '@src/types/citeFormat';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
import ButtonSpinner from '@src/components/spinner/buttonSpinner';
const styles = require('./citationBox.scss');

export interface CitationBoxProps {
  paperId: string;
  activeTab: AvailableCitationType;
  isLoading: boolean;
  citationText: string;
  handleClickCitationTab: (tab: AvailableCitationType) => void;
  fetchCitationText: () => void;
  closeCitationDialog: () => void;
}

function exportSingleCitation(type: AvailableExportCitationType, selectedPaperIds: string[]) {
  let actionLabel;

  if (type === AvailableExportCitationType.RIS) {
    actionLabel = 'RIS';
  } else {
    actionLabel = 'BIBTEX';
  }

  exportCitationText(type, selectedPaperIds);

  ActionTicketManager.trackTicket({
    pageType: getCurrentPageType(),
    actionType: 'fire',
    actionArea: 'exportSingleCitationButton',
    actionTag: 'citePaper',
    actionLabel,
  });
}

class CitationBox extends React.PureComponent<CitationBoxProps> {
  public componentDidMount() {
    this.props.fetchCitationText();
  }

  public render() {
    const { paperId, closeCitationDialog } = this.props;

    return (
      <div className={styles.boxContainer}>
        <div className={styles.boxWrapper}>
          <div style={{ marginTop: 0 }} className={styles.header}>
            <div className={styles.title}>Cite</div>
            <Icon icon="X_BUTTON" className={styles.iconWrapper} onClick={closeCitationDialog} />
          </div>
          {this.getTabs()}
          {this.getTextBox()}
        </div>
        <div className={styles.downloadBtnWrapper}>
          <span className={styles.orSyntax}>or</span> Download as
          <button
            className={styles.downloadBtn}
            onClick={() => exportSingleCitation(AvailableExportCitationType.RIS, [paperId])}
          >
            RIS
          </button>
          <button
            className={styles.downloadBtn}
            onClick={() => exportSingleCitation(AvailableExportCitationType.BIBTEX, [paperId])}
          >
            BibTeX
          </button>
        </div>
      </div>
    );
  }

  private getFullFeatureTabs = () => {
    const { handleClickCitationTab, activeTab } = this.props;

    return (
      <span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.MLA);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'MLA' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.MLA,
          })}
        >
          MLA
        </span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.BIBTEX);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'BIBTEX' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.BIBTEX,
          })}
        >
          BIBTEX
        </span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.IEEE);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'IEEE' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.IEEE,
          })}
        >
          IEEE
        </span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.VANCOUVER);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'VANCOUVER' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.VANCOUVER,
          })}
        >
          VANCOUVER
        </span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.CHICAGO);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'CHICAGO' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.CHICAGO,
          })}
        >
          CHICAGO
        </span>
        <span
          onClick={() => {
            handleClickCitationTab(AvailableCitationType.ACS);
            trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'ACS' });
          }}
          className={classNames({
            [`${styles.tabItem}`]: true,
            [`${styles.active}`]: activeTab === AvailableCitationType.ACS,
          })}
        >
          ACS
        </span>
      </span>
    );
  };

  private getTabs = () => {
    const { handleClickCitationTab, activeTab } = this.props;

    return (
      <div className={styles.tabBoxWrapper}>
        <div className={styles.normalTabWrapper}>
          <span
            onClick={() => {
              handleClickCitationTab(AvailableCitationType.APA);
              trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'APA' });
            }}
            className={classNames({
              [`${styles.tabItem}`]: true,
              [`${styles.active}`]: activeTab === AvailableCitationType.APA,
            })}
          >
            APA
          </span>
          <span
            onClick={() => {
              handleClickCitationTab(AvailableCitationType.HARVARD);
              trackEvent({ category: 'Additional Action', action: 'Click Citation Tab', label: 'HARVARD' });
            }}
            className={classNames({
              [`${styles.tabItem}`]: true,
              [`${styles.active}`]: activeTab === AvailableCitationType.HARVARD,
            })}
          >
            HARVARD
          </span>

          {this.getFullFeatureTabs()}
        </div>
      </div>
    );
  };

  private getTextBox = () => {
    const { isLoading, citationText } = this.props;

    if (isLoading) {
      return (
        <div className={styles.textBoxWrapper}>
          <div
            className={styles.textArea}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ButtonSpinner color="gray" variant="contained" size="small" />
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.textBoxWrapper}>
          <textarea value={citationText} className={styles.textArea} readOnly={true} />
          <div className={styles.copyButtonWrapper}>
            <div
              onClick={() => {
                this.handleClickCopyButton(citationText);
                trackEvent({ category: 'Additional Action', action: 'Copy Citation Button' });
              }}
              className={styles.copyButton}
            >
              Copy <Icon className={styles.copyIcon} icon="COPY" />
            </div>
          </div>
        </div>
      );
    }
  };

  private handleClickCopyButton = (citationText: string) => {
    copySelectedTextToClipboard(citationText);
  };
}

export default withStyles<typeof CitationBox>(styles)(CitationBox);
