import React from 'react';
import { Location } from 'history';
import SearchQueryManager from '../../../../helpers/searchQueryManager';
import DesktopPagination from '@src/components/desktopPagination';
import MobilePagination from '@src/components/mobilePagination';
import { getUrlDecodedQueryParamsObject } from '@src/helpers/makeNewFilterLink';
import { withStyles } from '@src/helpers/withStyles';
import { UserDevice } from '@src/reducers/layout';
const styles = require('../../search.scss');

interface PaginationProps {
  location: Location;
  totalPages: number;
  page: number;
  currentUserDevice: UserDevice;
}

const Pagination: React.FC<PaginationProps> = props => {
  const { page, totalPages, currentUserDevice, location } = props;

  const currentPageIndex: number = page - 1;

  const makePaginationLink = (page: number) => {
    const queryParamsObject = getUrlDecodedQueryParamsObject(location);
    const queryParams = SearchQueryManager.stringifyPapersQuery({
      ...queryParamsObject,
      page,
    });

    return `/search?${queryParams}`;
  };

  if (currentUserDevice !== UserDevice.DESKTOP) {
    return (
      <MobilePagination
        totalPageCount={totalPages}
        currentPageIndex={currentPageIndex}
        getLinkDestination={makePaginationLink}
        wrapperStyle={{
          margin: '12px 0',
        }}
      />
    );
  } else {
    return (
      <DesktopPagination
        type="paper_search_result"
        totalPage={totalPages}
        currentPageIndex={currentPageIndex}
        getLinkDestination={makePaginationLink}
        wrapperStyle={{
          margin: '32px 0 64px 0',
        }}
      />
    );
  }
};

export default withStyles<typeof Pagination>(styles)(Pagination);
