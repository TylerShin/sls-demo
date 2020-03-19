import React from 'react';
import { Link } from 'react-router-dom';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { withStyles } from '@src/helpers/withStyles';
import { PaperAuthor } from '@src/model/author';
import Icon from '../../../icons';
import { Paper } from '@src/model/paper';
import { PaperProfile } from '@src/model/profile';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const styles = require('./blockAuthorList.scss');

const MAXIMUM_PRE_AUTHOR_COUNT = 2;
const MAXIMUM_POST_AUTHOR_COUNT = 1;

interface BlockAuthorListProps {
  paper: Paper;
  pageType: PageType;
  ownProfileSlug?: string;
  actionArea?: ActionArea;
}

interface AuthorItemProps {
  author: PaperAuthor;
  pageType: PageType;
  isBold: boolean;
  isLast: boolean;
  actionArea?: ActionArea;
  profile?: PaperProfile;
}

const getProfileFromAuthor = (author: PaperAuthor, profiles: PaperProfile[]) => {
  return profiles.find(profile => profile.order === author.order);
};

const AuthorItem: React.FC<AuthorItemProps> = ({ author, pageType, actionArea, profile, isBold, isLast }) => {
  let affiliation = null;
  if (author.affiliation) {
    const affiliationName = author.affiliation.nameAbbrev
      ? `${author.affiliation.nameAbbrev}: ${author.affiliation.name}`
      : author.affiliation.name;
    affiliation = <span className={styles.affiliation}>{`(${affiliationName})`}</span>;
  }

  let hIndex = null;
  if (author.hindex) {
    hIndex = <span className={styles.hIndex}>{`H-Index: ${author.hindex}`}</span>;
  }

  const authorProfileLink = React.useMemo(() => {
    if (profile) return `/profiles/${profile.slug}`;
    return `/authors/${author.id}`;
  }, [profile, author]);

  return (
    <div style={{ fontWeight: isBold ? 'bold' : 'inherit' }} className={styles.profileAuthorItem}>
      <span className={styles.marker}>
        {isLast ? 'Last. ' : `#`}
        <span className={styles.markerNum}>{!isLast && author.order}</span>
      </span>
      <span className={styles.authorContentWrapper}>
        <Link
          to={authorProfileLink}
          onClick={() => {
            ActionTicketManager.trackTicket({
              pageType,
              actionType: 'fire',
              actionArea: actionArea || pageType,
              actionTag: 'authorShow',
              actionLabel: String(author.id),
            });
          }}
          className={styles.authorName}
        >
          {author.name}
        </Link>
        {author.name && author.affiliation && ' '}
        {affiliation}
        {hIndex}
      </span>
    </div>
  );
};

const BlockAuthorList: React.FC<BlockAuthorListProps> = ({ paper, pageType, actionArea, ownProfileSlug }) => {
  const { authors, profiles } = paper;

  if (authors.length === 0) return null;

  const profile = profiles.find(profile => profile.slug === ownProfileSlug);
  const profileAuthor = authors.find(author => profile && author.order === profile.order);
  const shouldAddProfileAuthor =
    profileAuthor && profileAuthor.order > MAXIMUM_PRE_AUTHOR_COUNT && profileAuthor.order < authors.length;

  const hasMore = authors.length >= MAXIMUM_PRE_AUTHOR_COUNT + MAXIMUM_POST_AUTHOR_COUNT;
  let viewAllAuthorsBtn = null;
  if (hasMore) {
    viewAllAuthorsBtn = (
      <div
        onClick={() => {
          GlobalDialogManager.openAuthorListDialog(paper, profile);
        }}
        className={styles.viewAll}
      >{`view all ${paper.authorCount} authors...`}</div>
    );
  }

  const preAuthorList = authors.slice(0, MAXIMUM_PRE_AUTHOR_COUNT).map(author => {
    return (
      <AuthorItem
        key={author.id}
        author={author}
        pageType={pageType}
        actionArea={actionArea}
        profile={getProfileFromAuthor(author, profiles)}
        isBold={!!profileAuthor && profileAuthor.order === author.order}
        isLast={false}
      />
    );
  });

  const postAuthorList =
    hasMore &&
    authors.slice(-MAXIMUM_POST_AUTHOR_COUNT).map(author => {
      return (
        <AuthorItem
          key={author.id}
          author={author}
          pageType={pageType}
          actionArea={actionArea}
          profile={getProfileFromAuthor(author, profiles)}
          isBold={!!profileAuthor && profileAuthor.order === author.order}
          isLast
        />
      );
    });

  return (
    <div className={styles.authorListWrapper}>
      <Icon className={styles.authorIcon} icon="AUTHOR" />
      <span className={styles.listWrapper}>
        {preAuthorList}
        {shouldAddProfileAuthor && (
          <AuthorItem
            key={profileAuthor!.id}
            author={profileAuthor!}
            pageType={pageType}
            actionArea={actionArea}
            profile={profile}
            isLast={false}
            isBold
          />
        )}
        {postAuthorList}
        {viewAllAuthorsBtn}
      </span>
    </div>
  );
};

export default withStyles<typeof BlockAuthorList>(styles)(BlockAuthorList);
