import React from 'react';
import { withStyles } from '@src/helpers/withStyles';
import CollectionAPI from '@src/api/collection';
import { Paper } from '@src/model/paper';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import { useObserver } from '@src/hooks/useIntersectionHook';
import { ActionTicketParams } from '@src/helpers/actionTicketManager/actionTicket';
import { SimplePaperItem } from '@src/components/paperItem/simplePaperItem';
const styles = require('./relatedPaperInCollectionShow.scss');

interface RelatedPaperInCollectionShowProps {
  collectionId: number;
}

const RelatedPaperItem: React.FunctionComponent<{ paper: Paper }> = props => {
  const { paper } = props;
  const actionTicketContext: ActionTicketParams = {
    pageType: 'collectionShow',
    actionType: 'view',
    actionArea: 'relatedPaperList',
    actionTag: 'viewRelatedPaper',
    actionLabel: String(paper.id),
  };

  const { elRef } = useObserver(0.8, actionTicketContext);

  return (
    <div className={styles.paperItemWrapper} ref={elRef}>
      <SimplePaperItem key={paper.id} paper={paper} pageType="collectionShow" actionArea="relatedPaperList" />
    </div>
  );
};

const RelatedPaperInCollectionShow: React.FunctionComponent<RelatedPaperInCollectionShowProps> = props => {
  const { collectionId } = props;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [relatedPapers, setRelatedPapers] = React.useState<Paper[]>([]);

  React.useEffect(() => {
    setIsLoading(true);
    CollectionAPI.getRelatedPaperInCollection(collectionId).then(result => {
      setRelatedPapers(result);
      setIsLoading(false);
    });
  }, [collectionId]);

  if (relatedPapers.length === 0) {
    return null;
  }

  const relatedPaperItems = relatedPapers.map((paper, index) => {
    if (index < 3) {
      return (
        <div key={paper.id}>
          <RelatedPaperItem paper={paper} />
        </div>
      );
    }
  });

  return (
    <div className={styles.relatedPaperContainer}>
      <div className={styles.titleContext}>📄 How about these papers?</div>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <ArticleSpinner className={styles.loadingSpinner} />
        </div>
      ) : (
        relatedPaperItems
      )}
    </div>
  );
};

export default withStyles<typeof RelatedPaperInCollectionShow>(styles)(RelatedPaperInCollectionShow);
