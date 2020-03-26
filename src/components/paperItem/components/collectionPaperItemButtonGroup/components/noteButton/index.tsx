import React from 'react';
import Popover from '@material-ui/core/Popover';
import { Button } from '@pluto_network/pluto-design-elements';
import CollectionPaperNote from '../collectionPaperNote';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import Icon from '@src/components/icons';
import { PageType, ActionArea } from '@src/constants/actionTicket';
const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('./noteButton.scss');

interface NoteButtonProps {
  paperId: string;
  collectionId: number;
  note?: string;
  pageType: PageType;
  actionArea: ActionArea;
}

const NoteButton: React.FC<NoteButtonProps> = ({ note, pageType, actionArea, paperId, collectionId }) => {
  useStyles(s);
  const noteRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const hasNote = !!note;

  return (
    <div ref={noteRef} className={s.addNoteButton}>
      <Button
        elementType="button"
        aria-label="Note to paper button"
        size="small"
        variant="outlined"
        color="gray"
        isLoading={false}
        onClick={() => {
          setIsOpen(!isOpen);
          if (hasNote) {
            ActionTicketManager.trackTicket({
              pageType,
              actionType: 'fire',
              actionArea: actionArea || pageType,
              actionTag: 'viewNote',
              actionLabel: String(paperId),
            });
          }
        }}
      >
        {hasNote ? (
          <>
            <Icon icon="NOTED" />
            <span>View Note</span>
          </>
        ) : (
          <>
            <Icon icon="ADD_NOTE" />
            <span>Add Note</span>
          </>
        )}
      </Button>
      <Popover
        open={isOpen}
        classes={{ paper: s.collectionNoteForm }}
        anchorEl={noteRef.current}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <CollectionPaperNote maxHeight={120} note={note} collectionId={collectionId} paperId={paperId} />
      </Popover>
    </div>
  );
};

export default NoteButton;
