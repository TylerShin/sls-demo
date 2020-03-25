import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import DesktopPagination from '@src/components/desktopPagination';
import MobilePagination from '@src/components/mobilePagination';
import getQueryParamsObject from '@src/helpers/getQueryParamsObject';
import { REF_CITED_CONTAINER_TYPE } from '@src/constants/paperShow';
import { UserDevice } from '@src/reducers/layout';
import { AppState } from '@src/store/rootReducer';
import { PaperShowMatchParams, PaperShowPageQueryParams } from '@src/pages/paperShow/types';
import { getStringifiedUpdatedQueryParams } from '@src/helpers/paperShowQueryParamsManager';

type RefCitedPapersPaginationProps = RouteComponentProps<PaperShowMatchParams> & {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
};

interface GetPaginationLinkParams {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
  queryParams: PaperShowPageQueryParams;
}

const getRefPaginationLink = ({ type, paperId, queryParams }: GetPaginationLinkParams) => (page: number) => {
  const queryParamsKey = type === 'reference' ? 'ref-page' : 'cited-page';

  return {
    to: `/papers/${paperId}`,
    search: getStringifiedUpdatedQueryParams(queryParams, { [queryParamsKey]: page }),
    state: { scrollTo: type },
  };
};

const RefCitedPagination: React.FC<RefCitedPapersPaginationProps> = props => {
  const { type, location, paperId } = props;
  const isMobile = useSelector((state: AppState) => state.layout.userDevice === UserDevice.MOBILE);
  const totalPage = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.referencePaperTotalPage : state.paperShow.citedPaperTotalPage;
  });
  const currentPage = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.referencePaperCurrentPage : state.paperShow.citedPaperCurrentPage;
  });

  const queryParams = getQueryParamsObject(location.search);

  if (isMobile) {
    return (
      <MobilePagination
        totalPageCount={totalPage}
        currentPageIndex={currentPage}
        getLinkDestination={getRefPaginationLink({ type, paperId, queryParams })}
        wrapperStyle={{
          margin: '12px 0',
        }}
      />
    );
  } else {
    return (
      <DesktopPagination
        type={`paper_show_${type}_papers`}
        totalPage={totalPage}
        currentPageIndex={currentPage}
        getLinkDestination={getRefPaginationLink({ type, paperId, queryParams })}
        wrapperStyle={{ margin: '32px 0 56px 0' }}
        actionArea={type === 'reference' ? 'refList' : 'citedList'}
      />
    );
  }
};

export default withRouter(RefCitedPagination);
