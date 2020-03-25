import React from 'react';
import { denormalize } from 'normalizr';
import classNames from 'classnames';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { withStyles } from '@src/helpers/withStyles';
import { Paper, paperSchema } from '@src/model/paper';
import { AUTH_LEVEL, blockUnverifiedUser } from '@src/helpers/checkAuthDialog';
import { AppState } from '@src/store/rootReducer';
import { CurrentUser } from '@src/model/currentUser';
import { SimplePaperItem } from '@src/components/paperItem/simplePaperItem';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
const styles = require('./relatedPapers.scss');

interface RelatedPapersProps {
  dispatch: Dispatch<any>;
  currentUser: CurrentUser;
  isLoadingPapers: boolean;
  relatedPapers: Paper[];
}

async function openSignInDialog() {
  await blockUnverifiedUser({
    authLevel: AUTH_LEVEL.VERIFIED,
    actionArea: 'paperShow',
    actionLabel: 'relatedPaperAtPaperShow',
    userActionType: 'relatedPaperAtPaperShow',
  });
}

const ContentBlocker: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.contentBlockedContainer}>
      <div className={styles.contentBlockedContext}>
        {`78% of Scinapse members use related papers.\nAfter signing in, all features are FREE.`}
      </div>
      <Button
        elementType="button"
        aria-label="Scinapse sign in button"
        onClick={openSignInDialog}
        style={{ marginTop: '24px' }}
      >
        <span>{`Sign in & View`}</span>
      </Button>
    </div>
  );
};

const RelatedPaperItem: React.FunctionComponent<{ paper: Paper }> = ({ paper }) => {
  return (
    <SimplePaperItem
      key={paper.id}
      className={styles.paperItemWrapper}
      paper={paper}
      pageType="paperShow"
      actionArea="relatedPaperList"
    />
  );
};

const RelatedPapersInPaperShow: React.FC<RelatedPapersProps> = React.memo(props => {
  const { relatedPapers, currentUser, isLoadingPapers } = props;

  if (!relatedPapers || relatedPapers.length === 0) {
    return null;
  }

  const relatedPaperItems = relatedPapers.slice(0, 3).map(paper => {
    return <RelatedPaperItem paper={paper} key={paper.id} />;
  });

  return (
    <div className={styles.relatedPaperContainer}>
      <div className={styles.titleContext}>📖 Papers frequently viewed together</div>
      {isLoadingPapers ? (
        <div className={styles.loadingContainer}>
          <ArticleSpinner className={styles.loadingSpinner} />
        </div>
      ) : (
        <>
          <div
            className={classNames({
              [styles.relatedPaperWrapper]: !currentUser.isLoggedIn,
            })}
          >
            {relatedPaperItems}
          </div>
          <ContentBlocker isLoggedIn={currentUser.isLoggedIn} />
        </>
      )}
    </div>
  );
});

function makeMapStateToProps() {
  return (state: AppState) => {
    return {
      currentUser: state.currentUser,
      isLoadingPapers: state.relatedPapersState.isLoading,
      relatedPapers: denormalize(state.relatedPapersState.paperIds, [paperSchema], state.entities),
    };
  };
}

export default connect(makeMapStateToProps)(
  withStyles<typeof RelatedPapersInPaperShow>(styles)(RelatedPapersInPaperShow)
);
