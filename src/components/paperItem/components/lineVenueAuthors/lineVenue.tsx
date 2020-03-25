import React from 'react';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { Journal } from '@src/model/journal';
import { withStyles } from '@src/helpers/withStyles';
import Icon from '@src/components/icons';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { ConferenceInstance } from '@src/model/conferenceInstance';
import DoiInPaperShow from './doiInPaperShow';
import { Paper } from '@src/model/paper';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const styles = require('./lineVenueAuthors.scss');

interface PaperItemVenueProps {
  paper: Paper;
  pageType: PageType;
  actionArea?: ActionArea;
  readOnly?: boolean;
  style?: React.CSSProperties;
}

const ConferenceTitle: React.FC<{
  conferenceInstance: ConferenceInstance;
}> = ({ conferenceInstance }) => {
  if (!conferenceInstance.conferenceSeries) return null;

  if (conferenceInstance.conferenceSeries.nameAbbrev) {
    return (
      <span className={styles.venueNameReadonly}>
        {' '}
        in {`${conferenceInstance.conferenceSeries.nameAbbrev} (${conferenceInstance.conferenceSeries.name})`}
      </span>
    );
  }

  return <span className={styles.venueNameReadonly}> in {conferenceInstance.conferenceSeries.name}</span>;
};

const TooltipBody = React.forwardRef<HTMLSpanElement, { journal: Journal }>(({ journal }, ref) => (
  <span ref={ref} className={styles.ifLabel}>
    <Icon className={styles.ifIconWrapper} icon="IMPACT_FACTOR" />
    <span>{journal.impactFactor!}</span>
  </span>
));

const JournalTitle: React.FC<{
  journal: Journal;
  readOnly?: boolean;
  pageType: PageType;
  actionArea?: ActionArea;
}> = ({ journal, readOnly, pageType, actionArea }) => {
  if (!journal.title) return null;

  if (readOnly) {
    return <span className={styles.venueNameReadonly}>{`in ${journal.title}`}</span>;
  }

  return (
    <>
      <span>{`in `}</span>
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
        className={styles.venueName}
      >
        {journal.title}
      </Link>
      {journal.impactFactor && (
        <Tooltip
          title="Impact Factor"
          placement="top"
          classes={{ tooltip: styles.arrowBottomTooltip }}
          disableFocusListener
          disableTouchListener
        >
          <TooltipBody journal={journal} />
        </Tooltip>
      )}
    </>
  );
};

const LineVenue = ({ style, readOnly, pageType, paper, actionArea }: PaperItemVenueProps) => {
  const { conferenceInstance, publishedDate, doi, journal, year } = paper;
  if (!journal && !publishedDate) return null;

  let title = null;
  if (journal && journal.title) {
    title = <JournalTitle journal={journal} readOnly={readOnly} pageType={pageType} actionArea={actionArea} />;
  } else if (conferenceInstance) {
    title = <ConferenceTitle conferenceInstance={conferenceInstance} />;
  }

  let yearStr = format(publishedDate, 'MMM D, YYYY');

  if (!publishedDate && year) {
    yearStr = String(year);
  }

  const lineYear = (
    <span>
      on <span className={styles.venueNameReadonly}>{yearStr}</span>
    </span>
  );

  const isPaperShow = pageType === 'paperShow';
  const isPaperDescription = actionArea === 'paperDescription';

  return (
    <div
      style={style}
      className={classNames({
        [styles.venue]: true,
        [styles.margin]: isPaperShow && isPaperDescription,
      })}
    >
      <Icon className={styles.journalIcon} icon="JOURNAL" />
      <div className={styles.journalText}>
        Published <span className={styles.bold}>{lineYear}</span>
        {title}
        {isPaperShow && isPaperDescription ? <DoiInPaperShow doi={doi} paperId={paper.id} /> : null}
      </div>
    </div>
  );
};

export default withStyles<typeof LineVenue>(styles)(LineVenue);
