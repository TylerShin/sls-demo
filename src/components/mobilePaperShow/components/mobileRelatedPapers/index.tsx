import React, { FC } from 'react';
import SimplePaperItem from '@src/components/paperItem/simplePaperItem';
const s = require('./mobileRelatedPapers.scss');
const useStyles = require('isomorphic-style-loader/useStyles');

interface Props {
  paperIds: string[];
  className?: string;
}

const MobileRelatedPapers: FC<Props> = ({ className, paperIds }) => {
  useStyles(s);
  if (!paperIds || !paperIds.length) return null;

  return (
    <div className={className}>
      {paperIds.map(paperId => (
        <SimplePaperItem
          className={s.relatedPaperItem}
          paperId={paperId}
          actionArea="relatedPaperList"
          pageType="paperShow"
          key={paperId}
        />
      ))}
    </div>
  );
};

export default MobileRelatedPapers;
