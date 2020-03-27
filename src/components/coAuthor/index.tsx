import React from 'react';
import { Link } from 'react-router-dom';
import MuiTooltip from '@material-ui/core/Tooltip';
import { isEqual } from 'lodash';
import { denormalize } from 'normalizr';
import { useSelector } from 'react-redux';
import { Author, authorSchema } from '@src/model/author/author';
import { trackEvent } from '@src/helpers/handleGA';
import HIndexBox from '@src/components/hIndexBox';
import Icon from '@src/components/icons';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { AppState } from '@src/store/rootReducer';
const useStyles = require('isomorphic-style-loader/useStyles');
const styles = require('./coAuthor.scss');

interface CoAuthorProps {
  authorId: string;
}

export const CoAuthor: React.FC<{ author: Author }> = ({ author }) => {
  useStyles(styles);

  return (
    <Link
      className={styles.authorItem}
      to={author.profile ? `/profiles/${author.profile.slug}` : `/authors/${author.id}`}
      onClick={() => {
        trackEvent({
          category: 'Flow to Author Show',
          action: 'Click Co-Author',
          label: 'Author Show',
        });
        ActionTicketManager.trackTicket({
          pageType: 'authorShow',
          actionType: 'fire',
          actionArea: 'coAuthor',
          actionTag: 'authorShow',
          actionLabel: String(author.id),
        });
      }}
    >
      <div className={styles.coAuthorItemHeader}>
        <div className={styles.coAuthorName}>
          {author.name}{' '}
          {author.profile && (
            <MuiTooltip classes={{ tooltip: styles.verificationTooltip }} title="Verified Author" placement="right">
              <div className={styles.contactIconWrapper}>
                <Icon icon="OCCUPIED" className={styles.occupiedIcon} />
              </div>
            </MuiTooltip>
          )}
        </div>
        <div className={styles.hIndexWrapper}>
          <HIndexBox hIndex={author.hindex} />
        </div>
      </div>
      <span className={styles.coAuthorAffiliation}>
        {author.lastKnownAffiliation ? author.lastKnownAffiliation.name : ''}
      </span>
    </Link>
  );
};

const CoAuthorContainer = React.memo(({ authorId }: CoAuthorProps) => {
  const author = useSelector<AppState, Author | undefined>(
    state => denormalize(authorId, authorSchema, state.entities),
    isEqual
  );

  if (!author) return null;

  return <CoAuthor author={author} />;
});

export default CoAuthorContainer;
