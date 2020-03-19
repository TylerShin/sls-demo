import React from 'react';
import classNames from 'classnames';
import MobileVenue from './mobileVenue';
import MobileAuthors from './mobileAuthors';
import { Paper } from '@src/model/paper';
import Icon from '../../../icons';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./mobileVenueAuthors.scss');

interface MobileVenueAuthorsProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
}

const MobileVenueAuthors: React.FC<MobileVenueAuthorsProps> = ({ paper, pageType, actionArea }) => {
  useStyles(s);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={s.wrapper}>
      <MobileVenue paper={paper} pageType={pageType} actionArea={actionArea} />
      <div className={s.authorBox}>
        <MobileAuthors paper={paper} pageType={pageType} actionArea={actionArea} isExpanded={isExpanded} />
        <Icon
          icon="ARROW_DOWN"
          onClick={() => setIsExpanded(!isExpanded)}
          className={classNames({
            [s.arrowIcon]: true,
            [s.isExpanded]: isExpanded,
          })}
        />
      </div>
    </div>
  );
};

export default MobileVenueAuthors;
