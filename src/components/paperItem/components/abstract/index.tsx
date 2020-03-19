import React from 'react';
import { useSelector } from 'react-redux';
import { withStyles } from '@src/helpers/withStyles';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import { formulaeToHTMLStr } from '@src/helpers/displayFormula';
import { PageType, ActionArea } from '@src/constants/actionTicket';
import { AppState } from '@src/store/rootReducer';
import { UserDevice } from '@src/reducers/layout';
const styles = require('./abstract.scss');

const MAX_LENGTH_OF_ABSTRACT = 500;
const MOBILE_MAX_LENGTH_OF_ABSTRACT = 200;

export interface AbstractProps {
  paperId: string;
  abstract: string;
  pageType: PageType;
  actionArea: ActionArea;
}

export interface AbstractStates extends Readonly<{}> {
  isExtendContent: boolean;
}

function createLatexParsedMarkup(rawHTML: string) {
  return { __html: formulaeToHTMLStr(rawHTML) };
}

const Abstract: React.FC<AbstractProps> = ({ abstract, pageType, actionArea, paperId }) => {
  const [isExtendContent, setIsExtendContent] = React.useState(false);
  const userDevice = useSelector<AppState, UserDevice>(state => state.layout.userDevice);
  const abstractMaxLength = userDevice === UserDevice.MOBILE ? MOBILE_MAX_LENGTH_OF_ABSTRACT : MAX_LENGTH_OF_ABSTRACT;

  if (!abstract) {
    return null;
  }

  const cleanAbstract = abstract
    .replace(/^ /gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/#[A-Z0-9]+#/g, '')
    .replace(/\n|\r/g, ' ');

  let finalAbstract;
  if (cleanAbstract.length > abstractMaxLength && !isExtendContent) {
    finalAbstract = cleanAbstract.slice(0, abstractMaxLength) + '...';
  } else {
    finalAbstract = cleanAbstract;
  }

  return (
    <div className={styles.abstract}>
      <span dangerouslySetInnerHTML={createLatexParsedMarkup(finalAbstract)} />
      {finalAbstract.length > abstractMaxLength ? (
        <label
          className={styles.moreOrLess}
          onClick={() => {
            setIsExtendContent(!isExtendContent);
            ActionTicketManager.trackTicket({
              pageType,
              actionType: 'fire',
              actionArea: actionArea || pageType,
              actionTag: isExtendContent ? 'collapseAbstract' : 'extendAbstract',
              actionLabel: String(paperId),
            });
          }}
        >
          {isExtendContent ? <span>less</span> : <span>more</span>}
        </label>
      ) : null}
    </div>
  );
};

export default withStyles<typeof Abstract>(styles)(Abstract);
