import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import { PendingPaper } from '@src/reducers/profilePendingPaperList';
import Icon from '@src/components/icons';
import { removeProfilePendingPaper } from '@src/actions/profile';
import PlutoAxios from '@src/api/pluto';
import alertToast from '@src/helpers/makePlutoToastAction';
import GlobalDialogManager from '@src/helpers/globalDialogManager';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./pendingPaperItem.scss');

interface PendingPaperItemProps {
  paper: PendingPaper;
  isEditable: boolean;
  isLoadingToResolved: boolean;
}

const PendingPaperItem: React.FC<PendingPaperItemProps> = ({ paper, isEditable, isLoadingToResolved }) => {
  useStyles(s);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const yearNode = !paper.year ? '' : paper.year + ` ・ `;
  const journalNode = !paper.journal ? '' : paper.journal + ` | `;
  const authorsNode = !paper.author ? '' : paper.author;
  const resolveBtnContextNode = !paper.tryAgain ? 'Resolve' : 'Try Again';

  const onRemovePendingPaper = async () => {
    setIsLoading(true);

    const removeConfirm = confirm('Do you really want to REMOVE this pending paper?');

    if (!removeConfirm) {
      return setIsLoading(false);
    }

    try {
      await dispatch(removeProfilePendingPaper(paper.id));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      const error = PlutoAxios.getGlobalError(err);
      alertToast({ type: 'error', message: error.message });
    }
  };

  return (
    <div className={s.pendingPaperItemWrapper}>
      <div className={s.pendingPaperContentsWrapper}>
        <div className={s.pendingPaperItemTitle}>{paper.title}</div>
        <div className={s.pendingPaperItemVenueAndAuthor}>
          {yearNode}
          {journalNode}
          {authorsNode}
        </div>
      </div>
      {isEditable && false && (
        <>
          <div className={s.resolveBtnWrapper}>
            <Button
              elementType="button"
              size="small"
              color="gray"
              isLoading={isLoading || isLoadingToResolved}
              onClick={() => GlobalDialogManager.openResolvedPendingPaperDialog(paper)}
            >
              <span>{resolveBtnContextNode}</span>
            </Button>
          </div>
          <div className={s.removeBtnWrapper}>
            <Button
              elementType="button"
              size="small"
              color="gray"
              variant="text"
              onClick={onRemovePendingPaper}
              isLoading={isLoading || isLoadingToResolved}
            >
              <Icon icon="X_BUTTON" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PendingPaperItem;
