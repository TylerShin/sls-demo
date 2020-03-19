import React from 'react';
import axios, { CancelTokenSource } from 'axios';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import classNames from 'classnames';
import { withStyles } from '@src/helpers/withStyles';
import { useDebouncedFetch } from '@src/hooks/useDebouncedFetch';
import { fetchJournalSuggestion, JournalSuggestion } from '@src/api/completion';
import Icon from '@src/components/icons';
import reducer, { journalFilterInputInitialState } from './reducer';
import { handleDropdownKeydown } from '@src/helpers/handleDropdownKeydown';
import JournalItem from '../journalFilterItem';
import { AggregationJournal } from '@src/model/aggregation';
import { getAxiosInstance } from '@src/api/axios';
const s = require('./journalFilterInput.scss');

interface JournalFilterInputProps {
  forwardedRef: React.MutableRefObject<HTMLInputElement | null>;
  onSubmit: (journals: AggregationJournal[]) => void;
}

const mapJournalSuggestionToAggregationJournal = (journal: JournalSuggestion): AggregationJournal => {
  return {
    id: journal.journalId,
    title: journal.keyword,
    abbrev: journal.abbrev,
    sci: journal.sci,
    jc: journal.jc,
    docCount: 0,
    impactFactor: journal.impactFactor,
    missingDocCount: true,
  };
};

const JournalFilterInput: React.FC<JournalFilterInputProps> = props => {
  const cancelTokenSource = React.useRef<CancelTokenSource>(axios.CancelToken.source());
  const [state, dispatch] = React.useReducer(reducer, journalFilterInputInitialState);

  const { data: journalSuggestions, setParams: setKeyword } = useDebouncedFetch<string, JournalSuggestion[]>({
    initialParams: '',
    fetchFunc: async (q: string) => {
      const res = await fetchJournalSuggestion({
        query: q,
        cancelToken: cancelTokenSource.current.token,
        axios: getAxiosInstance(),
      });
      return res;
    },
    validateFunc: (query: string) => {
      if (!query || query.length < 2) throw new Error('keyword is too short');
    },
    wait: 200,
  });

  const handleSubmit = () => {
    if (!journalSuggestions) {
      return dispatch({ type: 'CLOSE_BOX' });
    }

    const journals: AggregationJournal[] = journalSuggestions
      .filter(j => state.selectedJournalIds.includes(j.journalId))
      .map(mapJournalSuggestionToAggregationJournal);
    props.onSubmit(journals);
    dispatch({ type: 'CLOSE_BOX' });
  };

  const handleSelectItem = React.useCallback((journalId: string) => {
    dispatch({
      type: 'TOGGLE_JOURNAL',
      payload: {
        journalId,
      },
    });
  }, []);

  React.useEffect(() => {
    setKeyword(state.genuineInputValue);
    return () => {
      cancelTokenSource.current.cancel();
      cancelTokenSource.current = axios.CancelToken.source();
    };
  }, [state.genuineInputValue]);

  let journalList = null;
  if (journalSuggestions && journalSuggestions.length > 0) {
    journalList = journalSuggestions.map((journal, i) => {
      return (
        <JournalItem
          key={journal.journalId}
          journal={mapJournalSuggestionToAggregationJournal(journal)}
          onClick={handleSelectItem}
          checked={state.selectedJournalIds.includes(journal.journalId)}
          isHighlight={i === state.highlightIdx}
          isSearchResult
        />
      );
    });
  }
  const shouldShowList = state.isOpen && journalList && journalList.length > 0;

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (state.isOpen) {
          handleSubmit();
        }
      }}
    >
      <div className={classNames({ [s.wrapper]: true, [s.listOpened]: state.isOpen && !!journalList })}>
        <div className={s.inputWrapper}>
          <Icon icon="SEARCH" className={s.searchIcon} />
          <input
            ref={props.forwardedRef}
            value={state.inputValue}
            onKeyDown={e => {
              if (journalSuggestions && journalSuggestions.length > 0) {
                handleDropdownKeydown<JournalSuggestion>({
                  e,
                  list: journalSuggestions || [],
                  currentIdx: state.highlightIdx,
                  onMove: i => {
                    dispatch({
                      type: 'ARROW_KEYDOWN',
                      payload: {
                        targetIndex: i,
                        inputValue: journalSuggestions[i] ? journalSuggestions[i].keyword : state.genuineInputValue,
                      },
                    });
                  },
                  onSelect: i => {
                    if (i > -1 && journalSuggestions[i]) {
                      handleSelectItem(journalSuggestions[i].journalId);
                    }
                  },
                });
              }
            }}
            onFocus={() => {
              dispatch({ type: 'OPEN_BOX' });
            }}
            onChange={e => {
              const { value } = e.currentTarget;
              dispatch({ type: 'CHANGE_INPUT', payload: { inputValue: value } });
            }}
            placeholder="Search journal or conference"
            className={classNames({
              [s.input]: true,
              [s.listOpened]: shouldShowList,
            })}
          />
        </div>
        {shouldShowList && (
          <div className={s.listWrapper}>
            {journalList}
            <div className={s.controlBtnsWrapper}>
              <button
                className={s.clearBtn}
                onClick={() => {
                  dispatch({ type: 'CLEAR' });
                }}
              >
                Clear
              </button>
              <button className={s.applyBtn} onClick={handleSubmit}>
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default withStyles<typeof JournalFilterInput>(s)(JournalFilterInput);
