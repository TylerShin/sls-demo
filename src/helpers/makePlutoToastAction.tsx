import store from '@src/store';
import { ACTION_TYPES } from '../actions/actionTypes';
import { NotificationActionPayload } from '@src/types/notifier';

export default function alertToast(notificationActionPayload: NotificationActionPayload): void {
  store.dispatch({
    type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
    payload: notificationActionPayload,
  });
}
