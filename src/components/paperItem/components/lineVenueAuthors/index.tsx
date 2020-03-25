import React from 'react';
import LineVenue from './lineVenue';
import LineAuthors from './lineAuthors';
import Icon from '@src/components/icons';
import { Paper } from '@src/model/paper';
import { withStyles } from '@src/helpers/withStyles';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const styles = require('./lineVenueAuthors.scss');

export interface VenueAndAuthorsProps {
  paper: Paper;
  pageType: PageType;
  actionArea: ActionArea;
}

const LineVenueAuthors: React.FC<VenueAndAuthorsProps> = props => {
  const { paper, pageType, actionArea } = props;
  const { authors, profiles } = paper;

  return (
    <div className={styles.publishInfoList}>
      <LineVenue paper={paper} pageType={pageType} actionArea={actionArea} />
      {authors && authors.length > 0 && (
        <div className={styles.author}>
          <Icon className={styles.authorIcon} icon="AUTHOR" />
          <LineAuthors
            paper={paper}
            authors={authors}
            profiles={profiles}
            pageType={pageType}
            actionArea={actionArea}
            style={{ fontSize: '16px' }}
          />
        </div>
      )}
    </div>
  );
};

export default withStyles<typeof LineVenueAuthors>(styles)(LineVenueAuthors);
