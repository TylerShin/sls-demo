import React from 'react';
import { groupBy, Dictionary } from 'lodash';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import format from 'date-fns/format';
import isToday from 'date-fns/is_today';
import classNames from 'classnames';
import { withStyles } from '../../helpers/withStyles';
import Icon from '@src/components/icons';
import { Paper } from '../../model/paper';
import RelatedPaperItem from '@src/components/paperItem/relatedPaperItem';
import ActionTicketManager from '../../helpers/actionTicketManager';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from '@pluto_network/pluto-design-elements';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
const store = require('store');
const s = require('./researchHistory.scss');

export const RESEARCH_HISTORY_KEY = 'r_h_list';
const MAXIMUM_COUNT = 100;

export interface HistoryPaper extends Paper {
  savedAt: number; // Unix time
}

interface AggregatedPaper {
  aggregatedDate: string;
  historyPaper: HistoryPaper;
}

interface ResearchHistoryProps extends RouteComponentProps<any> {
  paper: Paper | null;
}

function getAggregatedHistoryPapers(rawPapers: HistoryPaper[]) {
  if (rawPapers.length === 0) return null;

  const aggregatedPapers: AggregatedPaper[] = rawPapers.map(rawPaper => {
    const dateStr = format(rawPaper.savedAt, 'MMM D, YYYY');
    return { aggregatedDate: dateStr, historyPaper: rawPaper };
  });

  const finalAggregatedPapers = groupBy(aggregatedPapers, aggregatedPapers => aggregatedPapers.aggregatedDate);
  return finalAggregatedPapers;
}

const ResearchHistory: React.FunctionComponent<ResearchHistoryProps> = ({ paper, location }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [papers, setPapers] = React.useState<HistoryPaper[]>([]);
  const [aggregatedPapers, setAggregatedPapers] = React.useState<Dictionary<AggregatedPaper[]> | null>();
  const currentLocation = React.useRef(location);

  React.useEffect(() => {
    const historyPapers = store.get(RESEARCH_HISTORY_KEY) || [];
    setPapers(historyPapers);
    setAggregatedPapers(getAggregatedHistoryPapers(historyPapers));
  }, []);

  React.useEffect(() => {
    if (location !== currentLocation.current) {
      setIsOpen(false);
      currentLocation.current = location;
    }
  }, [location]);

  React.useEffect(() => {
    if (!!paper) {
      const now = Date.now();
      const newPaper: HistoryPaper | null = { ...paper, savedAt: now };
      const oldPapers: HistoryPaper[] = store.get(RESEARCH_HISTORY_KEY) || [];
      const i = oldPapers.findIndex(p => String(p.id) === String(paper.id));
      const newPapers =
        i > -1
          ? [newPaper, ...oldPapers.slice(0, i), ...oldPapers.slice(i + 1)]
          : [newPaper, ...oldPapers].slice(0, MAXIMUM_COUNT);
      store.set(RESEARCH_HISTORY_KEY, newPapers);
      setPapers(newPapers);
      setAggregatedPapers(getAggregatedHistoryPapers(newPapers));
    }
  }, [paper]);

  const todayPapers = papers.filter(p => p.savedAt && isToday(p.savedAt));

  const aggregatedDates = aggregatedPapers && Object.keys(aggregatedPapers);

  const innerContent = (
    <div className={s.paperListWrapper}>
      {aggregatedDates && aggregatedDates.length > 0 ? (
        aggregatedDates.map((date, i) => {
          const finalDate = isToday(new Date(date)) ? 'Today' : date;

          const historyPapersContent =
            aggregatedPapers &&
            aggregatedPapers[date].map((paper: AggregatedPaper) => (
              <RelatedPaperItem
                key={paper.historyPaper.id}
                paper={paper.historyPaper}
                actionArea="researchHistory"
                disableVisitedColour
              />
            ));

          return (
            <div className={s.historyItemWrapper} key={i}>
              <div className={s.dayLabel}>{finalDate}</div>
              {historyPapersContent}
            </div>
          );
        })
      ) : (
        <span className={s.noHistoryContext}>Browse Scinapse! Your research history will be here.</span>
      )}
    </div>
  );

  const paperList = isOpen ? innerContent : null;

  const content = (
    <>
      <Button
        elementType="button"
        aria-label="History button"
        size="medium"
        variant="text"
        color="gray"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            ActionTicketManager.trackTicket({
              pageType: getCurrentPageType(),
              actionType: 'fire',
              actionArea: 'topBar',
              actionTag: 'researchHistory',
              actionLabel: `${todayPapers.length}`,
            });
          }
        }}
      >
        <Icon icon="HISTORY" />
        <span>History</span>
      </Button>
      <div className={classNames({ [s.boxWrapper]: isOpen })}>{paperList}</div>
    </>
  );

  if (isOpen) {
    return (
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(false);
        }}
      >
        <div className={s.openBoxWrapper}>{content}</div>
      </ClickAwayListener>
    );
  }

  return <>{content}</>;
};

export default withRouter(withStyles<typeof ResearchHistory>(s)(ResearchHistory));
