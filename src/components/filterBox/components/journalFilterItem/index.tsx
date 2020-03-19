import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { withStyles } from '@src/helpers/withStyles';
import { AggregationJournal } from '@src/model/aggregation';
import formatNumber from '@src/helpers/formatNumber';
import Icon from '@src/components/icons';

const s = require('./journalFilterItem.scss');
interface JournalItemProps {
  journal: AggregationJournal;
  checked: boolean;
  isHighlight: boolean;
  onClick: (journalId: string) => void;
  isSearchResult?: boolean;
}

const JournalItem: React.FC<JournalItemProps> = React.memo(props => {
  const { journal } = props;

  let ImpactFactor = null;
  if (journal.impactFactor) {
    ImpactFactor = (
      <span
        className={classNames({
          [s.ifLabel]: true,
          [s.noDocCount]: props.isSearchResult,
        })}
      >
        <Tooltip
          title="Impact Factor"
          placement="top"
          classes={{ tooltip: s.arrowBottomTooltip }}
          disableFocusListener
          disableTouchListener
        >
          <span>
            <Icon className={s.ifIconWrapper} icon="IMPACT_FACTOR" />
            {journal.impactFactor.toFixed(2)}
          </span>
        </Tooltip>
      </span>
    );
  }

  let docCount = null;
  if (!props.isSearchResult && !journal.missingDocCount) {
    docCount = <span className={s.countBox}>{`(${formatNumber(journal.docCount)})`}</span>;
  }

  let title = journal.title;
  if (journal.jc === 'CONFERENCE' && journal.abbrev) {
    title = `${journal.abbrev}: ${journal.title}`;
  }

  return (
    <button
      onClick={() => {
        props.onClick(journal.id);
      }}
      className={classNames({
        [s.journalItem]: true,
        [s.searchResult]: props.isSearchResult,
        [s.isSelected]: props.checked,
        [s.highlighted]: props.isHighlight,
      })}
    >
      <input type="checkbox" className={s.checkbox} checked={props.checked} readOnly />
      <span className={s.title}>{title}</span>
      {ImpactFactor}
      {docCount}
    </button>
  );
});

export default withStyles<typeof JournalItem>(s)(JournalItem);
