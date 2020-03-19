import React from 'react';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import { ConferenceInstance } from '@src/model/conferenceInstance';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { Journal } from '@src/model/journal';
import Icon from '../../../icons';
import { withStyles } from '@src/helpers/withStyles';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const styles = require('./blockVenue.scss');

interface BlockVenueProps {
  journal: Journal | null;
  conferenceInstance: ConferenceInstance | null;
  publishedDate: string | null;
  year: number;
  pageType: PageType;
  actionArea?: ActionArea;
}

const TooltipBody = React.forwardRef<HTMLSpanElement>((_props, ref) => (
  <span className={styles.ifIconWrapper} ref={ref}>
    <Icon className={styles.ifIcon} icon="IMPACT_FACTOR" />
  </span>
));

const BlockVenue: React.FC<BlockVenueProps> = ({
  journal,
  conferenceInstance,
  publishedDate,
  year,
  pageType,
  actionArea,
}) => {
  if (!journal && !conferenceInstance) return null;

  let publishedAtNode = null;

  if (publishedDate) {
    publishedAtNode = <span className={styles.publishedDate}>{format(publishedDate, 'MMM D, YYYY')}</span>;
  } else if (!publishedDate && year) {
    publishedAtNode = <span className={styles.publishedDate}>{String(year)}</span>;
  }

  let content = null;
  if (journal) {
    const impactFactor = journal.impactFactor && (
      <span className={styles.ifLabel}>
        <Tooltip
          title="Impact Factor"
          placement="top"
          classes={{ tooltip: styles.arrowBottomTooltip }}
          disableFocusListener
          disableTouchListener
        >
          <TooltipBody />
        </Tooltip>
        <span className={styles.ifLabelContentWrapper}>{journal.impactFactor.toFixed(2)}</span>
      </span>
    );

    content = (
      <Link
        to={`/journals/${journal.id}`}
        onClick={() => {
          ActionTicketManager.trackTicket({
            pageType,
            actionType: 'fire',
            actionArea: actionArea || pageType,
            actionTag: 'journalShow',
            actionLabel: String(journal.id),
          });
        }}
        className={styles.journalContent}
      >
        {publishedAtNode}
        {publishedAtNode && journal.title && <span className={styles.middleDot}>{`·`}</span>}
        <span className={styles.journalTitle}>{journal.title}</span>
        {impactFactor}
      </Link>
    );
  }

  if (conferenceInstance && conferenceInstance.conferenceSeries && conferenceInstance.conferenceSeries.name) {
    const title = conferenceInstance.conferenceSeries.nameAbbrev
      ? `${conferenceInstance.conferenceSeries.nameAbbrev} (${conferenceInstance.conferenceSeries.name})`
      : conferenceInstance.conferenceSeries.name;
    content = (
      <span className={styles.journalContent}>
        {publishedAtNode}
        <span className={styles.venueNameReadonly}> in {title}</span>
      </span>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Icon icon="JOURNAL" className={styles.journalIcon} />
      {content}
    </div>
  );
};

export default withStyles<typeof BlockVenue>(styles)(BlockVenue);
