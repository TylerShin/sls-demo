import { FILTER_BOX_TYPE } from '@src/types/filterBox';
import { trackEvent } from '@src/helpers/handleGA';
import ActionTicketManager from '@src/helpers/actionTicketManager';

export default function trackSelectFilter(actionType: FILTER_BOX_TYPE, actionValue: string | number) {
  trackEvent({ category: 'Filter', action: actionType, label: String(actionValue) });
  ActionTicketManager.trackTicket({
    pageType: 'searchResult',
    actionType: 'fire',
    actionArea: 'filter',
    actionTag: actionType,
    actionLabel: String(actionValue),
  });
}
