import React from 'react';
import classNames from 'classnames';
import formatNumber from '@src/helpers/formatNumber';
import { AggregationFos } from '@src/model/aggregation';
import { withStyles } from '@src/helpers/withStyles';
const s = require('./fosFilterDropdown.scss');

interface FOSItemProps {
  FOS: AggregationFos;
  selected: boolean;
  onClick: (FOSId: string) => void;
  isHighlight?: boolean;
  isSearchResult?: boolean;
}

const FOSItem: React.FC<FOSItemProps> = ({ FOS, onClick, selected, isSearchResult, isHighlight }) => {
  let docCount = null;
  if (!isSearchResult && !FOS.missingDocCount) {
    docCount = <span className={s.countBox}>{`(${formatNumber(FOS.docCount)})`}</span>;
  }

  return (
    <button
      onClick={() => {
        onClick(FOS.id);
      }}
      className={classNames({
        [s.FOSItemBtn]: true,
        [s.searchResult]: isSearchResult,
        [s.selected]: selected,
        [s.highlighted]: isHighlight,
      })}
    >
      <div className={s.fosNameWrapper}>
        <input type="checkbox" className={s.checkbox} checked={selected} readOnly />
        <span className={s.fosName}>{FOS.name}</span>
      </div>
      {docCount}
    </button>
  );
};

export default withStyles<typeof FOSItem>(s)(FOSItem);
