import React from 'react';
import { PaperFigure } from '@src/model/paper';
import { withStyles } from '@src/helpers/withStyles';
import SmallPaperFigure from '@src/components/paperFigure/smallPaperFigure';
import GlobalDialogManager from '@src/helpers/globalDialogManager';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { ActionTicketParams } from '@src/helpers/actionTicketManager/actionTicket';
import { useObserver } from '@src/hooks/useIntersectionHook';
const styles = require('./figures.scss');
const MAX_FIGURE_SHOW_LENGTH = 8;

interface FiguresProps {
  figures: PaperFigure[];
  paperId: string;
}

function openPaperFigureDetailDialog(figures: PaperFigure[], index: number, paperId: string) {
  ActionTicketManager.trackTicket({
    pageType: 'searchResult',
    actionType: 'fire',
    actionArea: 'figureList',
    actionTag: 'clickPaperFigure',
    actionLabel: String(paperId),
  });

  return GlobalDialogManager.openPaperFigureDetailDialog(figures, index, paperId);
}

const Figures: React.FC<FiguresProps> = ({ figures, paperId }) => {
  const figureViewTicketContext: ActionTicketParams = {
    pageType: 'searchResult',
    actionType: 'view',
    actionArea: 'paperItem',
    actionTag: 'viewFigure',
    actionLabel: String(paperId),
  };
  const { elRef } = useObserver(0.8, figureViewTicketContext);

  if (figures.length === 0) return null;

  const finalFigures = figures.slice(0, MAX_FIGURE_SHOW_LENGTH);

  const figureList = finalFigures.map((figure, i) => (
    <SmallPaperFigure
      figure={figure}
      key={i}
      handleOpenFigureDetailDialog={() => openPaperFigureDetailDialog(finalFigures, i, paperId)}
    />
  ));

  return (
    <div className={styles.smallPaperFiguresContainer} ref={elRef}>
      {figureList}
    </div>
  );
};

export default withStyles<typeof Figures>(styles)(Figures);
