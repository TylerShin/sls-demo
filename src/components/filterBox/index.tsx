import React from 'react';
import classNames from 'classnames';
import { parse } from 'qs';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import SearchQueryManager from '../../helpers/searchQueryManager';
import { ACTION_TYPES, SearchActions } from '../../actions/actionTypes';
import YearFilterDropdown from './components/yearFilterDropdown';
import JournalFilterDropdown from './components/journalFilterDropdown';
import FOSFilterDropdown from './components/fosFilterDropdown';
import SortingDropdown from './components/sortingDropdown';
import Icon from '@src/components/icons';
import makeNewFilterLink from '../../helpers/makeNewFilterLink';
import ActionTicketManager from '../../helpers/actionTicketManager';
import { withStyles } from '@src/helpers/withStyles';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
const s = require('./filterBox.scss');

type FilterBoxProps = RouteComponentProps &
  ReturnType<typeof mapStateToProps> & {
    dispatch: Dispatch<SearchActions>;
    query?: string;
  };

const FilterBox: React.FC<FilterBoxProps> = props => {
  const filterBoxRef = React.useRef(null);

  React.useEffect(() => {
    const currentQueryParams = parse(location.search, { ignoreQueryPrefix: true });
    const filters = SearchQueryManager.objectifyPaperFilter(currentQueryParams.filter);
    props.dispatch({
      type: ACTION_TYPES.ARTICLE_SEARCH_SYNC_FILTERS_WITH_QUERY_PARAMS,
      payload: {
        filters,
        sorting: currentQueryParams.sort || 'Relevance',
      },
    });
  }, []);

  React.useEffect(() => {
    if (props.detectedYear) {
      ActionTicketManager.trackTicket({
        pageType: 'searchResult',
        actionType: 'fire',
        actionArea: 'autoYearFilter',
        actionTag: 'autoYearFilterQuery',
        actionLabel: props.query || '',
      });
    }
  }, [props.detectedYear, props.query]);

  if (props.isMobile) return null;

  return (
    <>
      <div
        ref={filterBoxRef}
        className={classNames({
          [s.wrapper]: true,
          [s.activeWrapper]: !!props.activeButton,
        })}
      >
        <div className={s.controlBtns}>
          <span className={s.btnWrapper}>
            <YearFilterDropdown />
          </span>
          <span className={s.btnWrapper}>
            <JournalFilterDropdown />
          </span>
          <span className={s.btnWrapper}>
            <FOSFilterDropdown />
          </span>
          <span className={s.divider}>{'|'}</span>
          <span className={s.sortText}>{`Sort By`}</span>
          <span className={s.btnWrapper}>
            <SortingDropdown />
          </span>
        </div>
        {props.isFilterApplied && (
          <Link
            onClick={() => {
              if (props.enableAutoYearFilter && props.detectedYear) {
                ActionTicketManager.trackTicket({
                  pageType: 'searchResult',
                  actionType: 'fire',
                  actionArea: 'autoYearFilter',
                  actionTag: 'cancelAutoYearFilter',
                  actionLabel: props.query || '',
                });
                props.dispatch({ type: ACTION_TYPES.ARTICLE_SEARCH_DISABLE_AUTO_YEAR_FILTER });
              }
            }}
            to={makeNewFilterLink(
              {
                yearFrom: undefined,
                yearTo: undefined,
                fos: [],
                journal: [],
              },
              props.location
            )}
            className={s.clearButton}
          >
            <Icon icon="X_BUTTON" className={s.xIcon} />
            <span>Clear All</span>
          </Link>
        )}
      </div>
      <div
        className={classNames({
          [s.backdrop]: true,
          [s.activeBackdrop]: !!props.activeButton,
        })}
      />
    </>
  );
};

function mapStateToProps(state: AppState) {
  const { searchFilterState, layout } = state;

  return {
    isMobile: layout.userDevice === UserDevice.MOBILE,
    detectedYear: searchFilterState.detectedYear,
    enableAutoYearFilter: searchFilterState.enableAutoYearFilter,
    activeButton: searchFilterState.activeButton,
    isFilterApplied:
      !!searchFilterState.currentYearFrom ||
      !!searchFilterState.currentYearTo ||
      searchFilterState.selectedFOSIds.length > 0 ||
      searchFilterState.selectedJournalIds.length > 0 ||
      (searchFilterState.detectedYear && searchFilterState.enableAutoYearFilter),
  };
}

export default connect(mapStateToProps)(withRouter(withStyles<typeof FilterBox>(s)(FilterBox)));
