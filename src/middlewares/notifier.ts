import { Middleware } from 'redux';
import { NotificationAction } from '@src/types/notifier';
import EnvChecker from '../helpers/envChecker';
import { alertNotification, clearNotification } from '../actions/notifier';
const notie = require('notie');

const defaultNotieOptions = {
  time: 4,
  position: 'bottom',
  stay: false,
};

const ReduxNotifier: Middleware = () => next => (action: any) => {
  if (!EnvChecker.isOnServer() && action.type === alertNotification.toString()) {
    const notificationAction: NotificationAction = action;
    const notificationOptions = {
      ...defaultNotieOptions,
      ...notificationAction.payload.options,
    };

    notie.alert({
      type: notificationAction.payload.type,
      text: notificationAction.payload.message,
      stay: notificationOptions.stay,
      time: notificationOptions.time,
      position: notificationOptions.position,
    });
  } else if (action.type === clearNotification.toString()) {
    notie.hideAlerts();
  }

  return next(action);
};

export default ReduxNotifier;
