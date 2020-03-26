import React from 'react';
import { useSelector } from 'react-redux';
import { PaperInCollection } from '@src/model/paperInCollection';
import { CurrentUser } from '@src/model/currentUser';
import { CollectionShowState } from '@src/reducers/collectionShow';
import { Collection } from '@src/model/collection';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
import Icon from '@src/components/icons';
import { withStyles } from '@src/helpers/withStyles';
import formatNumber from '@src/helpers/formatNumber';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
import CollectionPaperItem from '@src/components/paperItem/collectionPaperItem';
import CollectionPapersControlBtns from '../collectionPapersControlBtns';
const styles = require('./collectionPaperList.scss');

interface CollectionPaperListProps {
  inOwnCollection: boolean;
  papersInCollection: PaperInCollection[];
  currentUser: CurrentUser;
  collectionShow: CollectionShowState;
  userCollection: Collection;
  onSelectedPaperInCollection: (paperId: string) => void;
  onRemovePaperFromCollection: (paperIds: string | string[]) => Promise<void>;
}

const CollectionPaperInfo: React.FC<{ collectionShow: CollectionShowState }> = ({ collectionShow }) => {
  return (
    <div className={styles.subHeader}>
      <div>
        <span className={styles.resultPaperCount}>{`${formatNumber(collectionShow.papersTotalCount)} Papers `}</span>
        <span className={styles.resultPaperPageCount}>
          {`(${collectionShow.currentPaperListPage} page of ${formatNumber(collectionShow.totalPaperListPage)} pages)`}
        </span>
      </div>
    </div>
  );
};

const CollectionPaperList: React.FC<CollectionPaperListProps> = props => {
  const {
    inOwnCollection,
    papersInCollection,
    collectionShow,
    userCollection,
    onSelectedPaperInCollection,
    onRemovePaperFromCollection,
  } = props;

  const userDevice = useSelector((state: AppState) => state.layout.userDevice);

  if (collectionShow.isLoadingPaperToCollection) {
    return (
      <div className={styles.loadingContainer}>
        <ArticleSpinner className={styles.loadingSpinner} />
      </div>
    );
  }

  if (!userCollection || !papersInCollection || papersInCollection.length === 0) {
    return (
      <div className={styles.noPaperWrapper}>
        <Icon icon="UFO" className={styles.ufoIcon} />
        <div className={styles.noPaperDescription}>No paper in this collection.</div>
      </div>
    );
  }

  const collectionPaperList = papersInCollection.map(paper => {
    return (
      <CollectionPaperItem
        key={paper.paperId}
        paper={paper}
        inOwnCollection={inOwnCollection}
        isMobile={userDevice === UserDevice.MOBILE}
        isChecked={collectionShow.selectedPaperIds.includes(paper.paperId)}
        collectionId={userCollection.id}
        onClickCheckBox={onSelectedPaperInCollection}
        onClickXButton={onRemovePaperFromCollection}
      />
    );
  });

  return (
    <>
      {userDevice !== UserDevice.MOBILE && (
        <CollectionPapersControlBtns
          inOwnCollection={inOwnCollection}
          collectionShow={collectionShow}
          onRemovePaperCollection={onRemovePaperFromCollection}
        />
      )}
      <CollectionPaperInfo collectionShow={collectionShow} />
      {collectionPaperList}
    </>
  );
};

export default withStyles<typeof CollectionPaperList>(styles)(CollectionPaperList);
