import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import HIndexBox from '@src/components/hIndexBox';
import { PaperAuthor } from '@src/model/author';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { PaperProfile } from '@src/model/profile';
import { getCurrentPageType } from '@src/helpers/getCurrentPageType';
const useStyles = require('isomorphic-style-loader/useStyles');
const styles = require('./authorListItem.scss');

interface Props {
  author: PaperAuthor;
  handleCloseDialogRequest: () => void;
  profile?: PaperProfile;
}

const AuthorListItem: FC<Props> = ({ author, profile, handleCloseDialogRequest }) => {
  useStyles(styles);

  return (
    <div className={styles.itemWrapper}>
      <Link
        to={profile && author.order === profile.order ? `/profiles/${profile.slug}` : `/authors/${author.id}`}
        onClick={() => {
          handleCloseDialogRequest();
          ActionTicketManager.trackTicket({
            pageType: getCurrentPageType(),
            actionType: 'fire',
            actionArea: 'authorDialog',
            actionTag: 'authorShow',
            actionLabel: String(author.id),
          });
        }}
      >
        <span className={styles.affiliation}>{author.affiliation ? author.affiliation.name : ''}</span>
        <span className={styles.authorName}>{author.name}</span>
        <span className={styles.hIndexBox}>
          <HIndexBox hIndex={author.hindex} />
        </span>
      </Link>
    </div>
  );
};

export default AuthorListItem;
