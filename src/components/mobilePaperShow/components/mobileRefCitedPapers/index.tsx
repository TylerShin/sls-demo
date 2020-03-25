import React, { FC, useCallback, useEffect, useState, useRef } from 'react';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import SimplePaperItemContainer from '@src/components/paperItem/simplePaperItem';
import RefCitedPagination from '@src/components/refCitedPagination';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import getQueryParamsObject from '@src/helpers/getQueryParamsObject';
import { InputField } from '@pluto_network/pluto-design-elements';
import Icon from '../../../icons';
import { REF_CITED_CONTAINER_TYPE } from '@src/constants/paperShow';
import { PaperShowMatchParams } from '@src/pages/paperShow/types';
import { AppState } from '@src/store/rootReducer';
import { getStringifiedUpdatedQueryParams } from '@src/helpers/paperShowQueryParamsManager';
import { PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import SortBox from '@src/components/sortBox';

const s = require('./mobileRefCitedPapers.scss');
const useStyles = require('isomorphic-style-loader/useStyles');

type Props = RouteComponentProps<PaperShowMatchParams> & {
  type: REF_CITED_CONTAINER_TYPE;
  paperCount: number;
  parentPaperId: string;
};

const MobileRefCitedPapers: FC<Props> = ({ type, parentPaperId, paperCount, history, location }) => {
  useStyles(s);
  const paperIds: string[] = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.referencePaperIds : state.paperShow.citedPaperIds;
  }, isEqual);
  const isLoading = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.isLoadingReferencePapers : state.paperShow.isLoadingCitedPapers;
  });
  const [query, setQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<PAPER_LIST_SORT_OPTIONS>('NEWEST_FIRST');
  const wrapperNode = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const queryParamsObject = getQueryParamsObject(location.search);
    if (type === 'reference') {
      setSortOption(queryParamsObject['ref-sort'] || 'NEWEST_FIRST');
      setQuery(queryParamsObject['ref-query'] || '');
    } else if (type === 'cited') {
      setSortOption(queryParamsObject['cited-sort'] || 'NEWEST_FIRST');
      setQuery(queryParamsObject['cited-query'] || '');
    }
  }, [location.search, type]);

  useEffect(() => {
    if (isLoading && location.state?.scrollTo === type && wrapperNode.current) {
      // 100 means means margin top for comfortable of viewing
      window.scrollTo(0, wrapperNode.current.offsetTop - 100);
    }
  }, [isLoading, location.state, type]);

  const handleSubmitSearch = useCallback(
    (query: string) => {
      const queryParamsObject = getQueryParamsObject(location.search);

      ActionTicketManager.trackTicket({
        pageType: 'paperShow',
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
        pathname: `/papers/${parentPaperId}`,
        search: getStringifiedUpdatedQueryParams(queryParamsObject, pageQueryParams),
        state: { scrollTo: type },
      });
    },
    [type, parentPaperId, location.search, history]
  );

  const handleClickSortOption = useCallback(
    (sortOption: PAPER_LIST_SORT_OPTIONS) => {
      const queryParamsObject = getQueryParamsObject(location.search);
      let pageQueryParams;

      if (type === 'reference') {
        pageQueryParams = { 'ref-sort': sortOption };
      } else {
        pageQueryParams = { 'cited-sort': sortOption };
      }

      history.push({
        pathname: `/papers/${parentPaperId}`,
        search: getStringifiedUpdatedQueryParams(queryParamsObject, pageQueryParams),
        state: { scrollTo: type },
      });
    },
    [type, parentPaperId, location.search, history]
  );

  if (!paperIds) return null;

  const title = type === 'reference' ? `References (${paperCount || 0})` : `Citations (${paperCount || 0})`;
  const placeholder = type === 'reference' ? 'Search papers in references' : 'Search papers in citations';

  if (isLoading) {
    return (
      <div ref={wrapperNode} className={s.loadingSection}>
        <ArticleSpinner />
      </div>
    );
  }

  if (paperIds.length === 0) {
    return (
      <div className={s.titleWrapper}>
        <div className={s.title}>{title}</div>
      </div>
    );
  }

  return (
    <div>
      <div className={s.titleWrapper}>
        <div className={s.title}>{title}</div>
        <SortBox
          onClickOption={handleClickSortOption}
          sortOption={sortOption}
          currentPage="paperShow"
          exposeRelevanceOption={false}
        />
      </div>

      <InputField
        aria-label="Scinapse search box in paper show"
        trailingIcon={<Icon icon="SEARCH" onClick={() => handleSubmitSearch(query)} />}
        placeholder={placeholder}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSubmitSearch(query);
          }
        }}
        value={query}
        onChange={e => setQuery(e.currentTarget.value)}
        style={{ marginBottom: '8px' }}
      />

      {paperIds.map(id => (
        <SimplePaperItemContainer
          key={id}
          className={s.itemWrapper}
          paperId={id}
          pageType="paperShow"
          actionArea={type === 'reference' ? 'refList' : 'citedList'}
        />
      ))}
      <RefCitedPagination type={type} paperId={parentPaperId} />
    </div>
  );
};

export default withRouter(MobileRefCitedPapers);
