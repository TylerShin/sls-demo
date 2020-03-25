import React from 'react';
import URL from 'url';
import classNames from 'classnames';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import { withStyles } from '@src/helpers/withStyles';
import { PaperSource } from '@src/model/paperSource';
import { trackAndOpenLink } from '@src/helpers/handleGA';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { isPDFLink } from '@src/helpers/getPDFLink';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const styles = require('./sourceURLPopover.scss');

interface SourceURLPopover {
  isOpen: boolean;
  handleCloseFunc: (e: any) => void;
  paperSources: PaperSource[];
  anchorEl: HTMLElement | null;
  pageType: PageType;
  paperId: string;
  actionArea?: ActionArea;
}

const SourceURLPopover: React.SFC<SourceURLPopover> = props => {
  const sources = props.paperSources.map(source => {
    const urlObj = URL.parse(source.url);

    return (
      <a
        className={styles.sourceItem}
        onClick={e => {
          trackAndOpenLink('search-item-source-button');
          ActionTicketManager.trackTicket({
            pageType: props.pageType,
            actionType: 'fire',
            actionArea: props.actionArea || props.pageType,
            actionTag: 'source',
            actionLabel: String(props.paperId),
          });
          props.handleCloseFunc(e);
        }}
        target="_blank"
        rel="noopener nofollow noreferrer"
        href={source.url}
        key={source.id}
      >
        <span
          className={classNames({
            [styles.host]: true,
            [styles.pdfHost]: isPDFLink(source),
          })}
        >
          {urlObj.host}
        </span>
        <Icon icon="EXTERNAL_SOURCE" className={styles.sourceIcon} />
      </a>
    );
  });

  return (
    <>
      <Popper
        anchorEl={props.anchorEl}
        placement="bottom-end"
        modifiers={{
          preventOverflow: {
            enabled: true,
            boundariesElement: 'window',
          },
        }}
        open={props.isOpen}
        style={{ zIndex: 10 }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <div className={styles.sourcesWrapper}>{sources}</div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default withStyles<typeof SourceURLPopover>(styles)(SourceURLPopover);
