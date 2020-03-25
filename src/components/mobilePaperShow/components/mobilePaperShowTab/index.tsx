import React, { FC } from 'react';
import Tab, { AvailablePaperShowTab } from '../paperShowTabItem';
import { Paper } from '@src/model/paper';

interface Props {
  active: AvailablePaperShowTab;
  onClick: (target: AvailablePaperShowTab) => void;
  paper: Paper;
  shouldShowRelatedTab: boolean;
}

const MobilePaperShowTab: FC<Props> = ({ active, onClick, paper, shouldShowRelatedTab }) => {
  return (
    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {shouldShowRelatedTab && (
        <Tab
          content="Related"
          active={active === AvailablePaperShowTab.related}
          onClick={onClick}
          type={AvailablePaperShowTab.related}
        />
      )}
      <Tab
        content={`References (${paper.referenceCount})`}
        active={active === AvailablePaperShowTab.ref}
        onClick={onClick}
        type={AvailablePaperShowTab.ref}
      />
      <Tab
        content={`Citations (${paper.citedCount})`}
        active={active === AvailablePaperShowTab.cited}
        onClick={onClick}
        type={AvailablePaperShowTab.cited}
      />
    </div>
  );
};

export default MobilePaperShowTab;
