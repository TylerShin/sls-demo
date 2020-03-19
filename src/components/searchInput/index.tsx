import React from 'react';
import Axios, { CancelTokenSource } from 'axios';
import classNames from 'classnames';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { fetchSuggestionKeyword, CompletionKeyword } from '../../api/completion';
import { AppState } from '../../store/rootReducer';
import { PAPER_LIST_SORT_OPTIONS, FilterObject } from '../../types/search';
import { UserDevice } from '../../reducers/layout';
import { useDebouncedFetch } from '../../hooks/useDebouncedFetch';
import { getAxiosInstance } from '../../api/axios';
import { ACTION_TYPES } from '../../actions/actionTypes';
import {
  getRecentQueries,
  deleteQueryFromRecentList,
  saveQueryToRecentHistory,
} from '../../helpers/recentQueryManager';
import ActionTicketManager from '../../helpers/actionTicketManager';
import { getCurrentPageType } from '../../helpers/getCurrentPageType';
import { trackEvent } from '../../helpers/handleGA';
import { changeSearchInput, closeMobileSearchBox, openMobileSearchBox } from '../../reducers/searchInput';
import Icon from '../icons';
import { handleDropdownKeydown } from '../../helpers/handleDropdownKeydown';
import { getRawHTMLWithBoldTag } from '../../helpers/getRawHTMLWithBoldTag';
import SearchQueryManager from '../../helpers/searchQueryManager';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./searchInput.scss');

type SearchQueryInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  actionArea: 'home' | 'topBar' | 'paperShow';
  maxCount: number;
  currentFilter?: FilterObject;
  wrapperClassName?: string;
  listWrapperClassName?: string;
  inputClassName?: string;
  sort?: PAPER_LIST_SORT_OPTIONS;
};

type SearchSourceType = 'history' | 'suggestion' | 'raw';

interface SubmitParams {
  from: SearchSourceType;
  query: string;
}

function validateSearchInput(query: string) {
  if (query.length < 2) {
    return false;
  }
  return true;
}

const SearchQueryInput: React.FC<SearchQueryInputProps> = props => {
  useStyles(s);
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const searchQuery = useSelector<AppState, string>(state => state.searchInput.query);
  const isOpenMobileSearchBox = useSelector<AppState, boolean>(state => state.searchInput.isOpenMobileBox);
  const isMobile = useSelector<AppState, boolean>(state => state.layout.userDevice === UserDevice.MOBILE);
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightIdx, setHighlightIdx] = React.useState(-1);
  const [inputValue, setInputValue] = React.useState(searchQuery || '');
  const cancelTokenSource = React.useRef<CancelTokenSource>(Axios.CancelToken.source());
  const { data: suggestionWords, setParams } = useDebouncedFetch<string, CompletionKeyword[]>({
    initialParams: '',
    fetchFunc: async (q: string) => {
      const res = await fetchSuggestionKeyword({
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

  const [genuineInputValue, setGenuineInputValue] = React.useState('');
  React.useEffect(() => {
    setRecentQueries(getRecentQueries(genuineInputValue));
  }, [genuineInputValue]);

  React.useEffect(() => {
    setInputValue(searchQuery);
    setGenuineInputValue(searchQuery);
    setParams(searchQuery);
  }, [searchQuery, setParams]);

  const [recentQueries, setRecentQueries] = React.useState(getRecentQueries(genuineInputValue));
  let keywordsToShow = recentQueries.slice(0, props.maxCount);
  if (suggestionWords && suggestionWords.length > 0) {
    const suggestionList = suggestionWords
      .filter(k => recentQueries.every(query => query.text !== k.keyword))
      .map(k => ({ text: k.keyword, removable: false }));

    keywordsToShow = [...recentQueries, ...suggestionList].slice(0, props.maxCount);
  }

  React.useEffect(() => {
    return () => {
      setIsOpen(false);
      cancelTokenSource.current.cancel();
      cancelTokenSource.current = Axios.CancelToken.source();
    };
  }, [location]);

  async function handleSubmit({ query, from }: SubmitParams) {
    const searchKeyword = (query || inputValue).trim();

    if (!validateSearchInput(searchKeyword)) {
      dispatch({
        type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
        payload: {
          type: 'error',
          message: 'You should search more than 2 characters.',
        },
      });
      return;
    }

    ActionTicketManager.trackTicket({
      pageType: getCurrentPageType(),
      actionType: 'fire',
      actionArea: props.actionArea,
      actionTag: 'query',
      actionLabel: searchKeyword,
    });
    if (from === 'history' || from === 'suggestion') {
      ActionTicketManager.trackTicket({
        pageType: getCurrentPageType(),
        actionType: 'fire',
        actionArea: props.actionArea,
        actionTag: from === 'history' ? 'searchHistoryQuery' : 'searchSuggestionQuery',
        actionLabel: searchKeyword,
      });
    }
    trackEvent({ category: 'Search', action: 'Query', label: searchKeyword });

    saveQueryToRecentHistory(searchKeyword);
    dispatch(changeSearchInput({ query: searchKeyword }));
    setIsOpen(false);

    const currentPage = getCurrentPageType();
    const searchQuery = SearchQueryManager.stringifyPapersQuery({
      query: searchKeyword,
      sort: props.sort || 'RELEVANCE',
      filter: props.currentFilter || {},
      page: 1,
    });

    if (currentPage === 'authorSearchResult') {
      history.push(`/search/authors?${searchQuery}`);
    } else {
      history.push(`/search?${searchQuery}`);
    }
  }

  function clickSearchBtn() {
    let from: SearchSourceType = 'raw';
    const matchKeyword = keywordsToShow.find(k => k.text === inputValue);
    if (matchKeyword && matchKeyword.removable) {
      from = 'history';
    } else if (matchKeyword && !matchKeyword.removable) {
      from = 'suggestion';
    }

    handleSubmit({ query: genuineInputValue, from });
  }

  const keywordItems = keywordsToShow.slice(0, props.maxCount).map((k, i) => {
    return (
      <li
        key={k.text + i}
        className={classNames({
          [s.listItem]: true,
          [s.highlight]: highlightIdx === i,
        })}
        onClick={() => {
          handleSubmit({
            query: k.text,
            from: k.removable ? 'history' : 'suggestion',
          });
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: getRawHTMLWithBoldTag(k.text, genuineInputValue),
          }}
        />
        {k.removable && (
          <Button
            elementType="button"
            aria-label="Remove search keyword button"
            size="small"
            variant="text"
            color="gray"
            onClick={e => {
              e.stopPropagation();
              deleteQueryFromRecentList(k.text);
              setRecentQueries(getRecentQueries(genuineInputValue));
            }}
          >
            <Icon icon="X_BUTTON" />
          </Button>
        )}
      </li>
    );
  });

  React.useEffect(() => {
    if (!isOpenMobileSearchBox) setIsOpen(false);
  }, [isOpenMobileSearchBox]);

  const listWrapperClassName = props.listWrapperClassName ? props.listWrapperClassName : s.list;
  const keywordList = isOpen ? <ul className={listWrapperClassName}>{keywordItems}</ul> : null;
  const wrapperClassName = props.wrapperClassName ? props.wrapperClassName : s.wrapper;
  const inputClassName = props.inputClassName ? props.inputClassName : s.input;
  const placeholder = isMobile ? 'Search papers by keyword' : 'Search papers by title, author, doi or keyword';
  const backButton = isOpenMobileSearchBox ? (
    <div className={s.searchButtonWrapper} style={{ left: '2px', right: 'auto', top: '2px' }}>
      <Button
        elementType="button"
        aria-label="Go back button"
        variant="text"
        isLoading={false}
        onClick={() => {
          setIsOpen(false);
          dispatch(closeMobileSearchBox());
        }}
      >
        <Icon icon="BACK" />
      </Button>
    </div>
  ) : null;

  const clearButton = isOpenMobileSearchBox ? (
    <div className={s.searchButtonWrapper} style={{ right: '52px', top: '2px' }}>
      <Button
        elementType="button"
        aria-label="Clear keyword button"
        variant="text"
        isLoading={false}
        color="gray"
        onClick={() => {
          setInputValue('');
          setGenuineInputValue('');
        }}
      >
        <Icon icon="X_BUTTON" />
      </Button>
    </div>
  ) : null;

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!isOpenMobileSearchBox) setIsOpen(false);
      }}
    >
      <div className={wrapperClassName}>
        {backButton}
        <input
          aria-label="Scinapse search box"
          value={inputValue}
          onKeyDown={e => {
            handleDropdownKeydown({
              e,
              list: keywordsToShow,
              currentIdx: highlightIdx,
              onMove: i => {
                setHighlightIdx(i);
                setInputValue(keywordsToShow[i] ? keywordsToShow[i].text : genuineInputValue);
              },
              onSelect: i => {
                let from: SearchSourceType = 'raw';
                if (keywordsToShow[i] && keywordsToShow[i].removable) {
                  from = 'history';
                } else if (keywordsToShow[i] && !keywordsToShow[i].removable) {
                  from = 'suggestion';
                }

                handleSubmit({
                  query: keywordsToShow[i] ? keywordsToShow[i].text : genuineInputValue,
                  from,
                });
              },
            });
          }}
          onFocus={() => {
            if (isMobile && !isOpenMobileSearchBox) {
              dispatch(openMobileSearchBox());
            }
            if (!isOpen) setIsOpen(true);
          }}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onChange={e => {
            const { value } = e.currentTarget;
            setHighlightIdx(-1);
            setInputValue(value);
            setGenuineInputValue(value);
            setParams(value);

            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          autoFocus={props.autoFocus}
          className={inputClassName}
        />
        {clearButton}
        <div className={s.searchButtonWrapper} style={props.actionArea == 'home' ? { top: '4px' } : { top: '2px' }}>
          {props.actionArea == 'home' ? (
            <Button elementType="button" aria-label="Search keyword button" size="medium" onClick={clickSearchBtn}>
              <Icon icon="SEARCH" />
              <span>Search</span>
            </Button>
          ) : (
            <Button
              elementType="button"
              aria-label="Simple search keyword button"
              size="medium"
              variant="text"
              onClick={clickSearchBtn}
            >
              <Icon icon="SEARCH" />
            </Button>
          )}
        </div>
        {keywordList}
      </div>
    </ClickAwayListener>
  );
};

export default SearchQueryInput;
