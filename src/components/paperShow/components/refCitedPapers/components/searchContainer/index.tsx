import React from 'react';
import { stringify } from 'qs';
import { withRouter, RouteComponentProps } from 'react-router';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import getQueryParamsObject from '@src/helpers/getQueryParamsObject';
import { InputField } from '@pluto_network/pluto-design-elements';
import Icon from '@src/components/icons';
import { PaperShowMatchParams, PaperShowPageQueryParams } from '@src/pages/paperShow/types';
import { REF_CITED_CONTAINER_TYPE } from '@src/constants/paperShow';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
import SortBox from '@src/components/sortBox';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
const styles = require('../../referencePapers.scss');

type SearchContainerProps = RouteComponentProps<PaperShowMatchParams> & {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
  placeholder?: string;
};

export function getStringifiedUpdatedQueryParams(queryParamsObject: PaperShowPageQueryParams, pageQueryParams: any) {
  const updatedQueryParamsObject: PaperShowPageQueryParams = {
    ...queryParamsObject,
    ...pageQueryParams,
  };

  const stringifiedQueryParams = stringify(updatedQueryParamsObject, {
    addQueryPrefix: true,
  });

  return stringifiedQueryParams;
}

const SearchContainer: React.FC<SearchContainerProps> = props => {
  const { history, type, paperId, placeholder, location } = props;
  const [sortOption, setSortOption] = React.useState<PAPER_LIST_SORT_OPTIONS>('NEWEST_FIRST');
  const [searchInput, setSearchInput] = React.useState('');

  React.useEffect(() => {
    const queryParamsObject = getQueryParamsObject(location.search);

    if (type === 'reference') {
      setSortOption(queryParamsObject['ref-sort'] || 'NEWEST_FIRST');
      setSearchInput(queryParamsObject['ref-query'] || '');
    } else if (type === 'cited') {
      setSortOption(queryParamsObject['cited-sort'] || 'NEWEST_FIRST');
      setSearchInput(queryParamsObject['cited-query'] || '');
    }
  }, [location.search, type]);

  const handleSubmitSearch = React.useCallback(
    (query: string) => {
      const queryParamsObject = getQueryParamsObject(location.search);

      ActionTicketManager.trackTicket({
        pageType: getCurrentPageType(),
        actionType: 'fire',
        actionArea: type,
        actionTag: 'query',
        actionLabel: query,
      });

      let pageQueryParams;
      if (type === 'reference') {
        pageQueryParams = { 'ref-query': query, 'ref-page': 1 };
      } else {
        pageQueryParams = { 'cited-query': query, 'cited-page': 1 };
      }

      history.push({
        pathname: `/papers/${paperId}`,
        search: getStringifiedUpdatedQueryParams(queryParamsObject, pageQueryParams),
        state: {
          scrollTo: type,
        },
      });
    },
    [type, paperId, location.search, history]
  );

  const handleClickSortOption = React.useCallback(
    (sortOption: PAPER_LIST_SORT_OPTIONS) => {
      const queryParamsObject = getQueryParamsObject(location.search);

      let pageQueryParams;

      if (type === 'reference') {
        pageQueryParams = { 'ref-sort': sortOption };
      } else {
        pageQueryParams = { 'cited-sort': sortOption };
      }

      history.push({
        pathname: `/papers/${paperId}`,
        search: getStringifiedUpdatedQueryParams(queryParamsObject, pageQueryParams),
        state: {
          scrollTo: type,
        },
      });
    },
    [type, paperId, location.search, history]
  );

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <InputField
          aria-label="Scinapse search box in paper show"
          leadingIcon={<Icon icon="SEARCH" onClick={() => handleSubmitSearch(searchInput)} />}
          placeholder={placeholder || 'Search papers'}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleSubmitSearch(searchInput);
            }
          }}
          onChange={e => setSearchInput(e.currentTarget.value)}
          value={searchInput}
        />
      </div>
      <div className={styles.sortBoxContainer}>
        <SortBox
          onClickOption={handleClickSortOption}
          sortOption={sortOption}
          currentPage="paperShow"
          exposeRelevanceOption={false}
        />
      </div>
    </div>
  );
};

export default withRouter(SearchContainer);
