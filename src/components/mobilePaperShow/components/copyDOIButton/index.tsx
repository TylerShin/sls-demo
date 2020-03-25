import React, { FC } from 'react';
import Icon from '@src/components/icons';
import copySelectedTextToClipboard from '@src/helpers/copySelectedTextToClipboard';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { PageType, ActionArea } from '@src/constants/actionTicket';

interface Props {
  doi: string;
  paperId: string;
  pageType: PageType;
  actionArea: ActionArea;
  className?: string;
}

const CopyDOIButton: FC<Props> = ({ doi, paperId, className, pageType, actionArea }) => {
  if (!doi) return null;

  const clickDOIButton = () => {
    copySelectedTextToClipboard(`https://doi.org/${doi}`);
    ActionTicketManager.trackTicket({
      pageType,
      actionType: 'fire',
      actionArea,
      actionTag: 'copyDoi',
      actionLabel: String(paperId),
    });
  };

  return (
    <button className={className} onClick={clickDOIButton}>
      <Icon icon="COPY_DOI" />
      <span>Copy DOI</span>
    </button>
  );
};

export default CopyDOIButton;
