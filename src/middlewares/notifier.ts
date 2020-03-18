import { Middleware } from "redux";
import EnvChecker from "../helpers/envChecker";
import { alertNotification, clearNotification } from "../actions/notifier";
const notie = require("notie");

type NotieAlertTypes = "success" | "warning" | "error" | "info" | "neutral";

interface NotieAlertOptions {
  text: string;
  stay: boolean; // default = false
  time: number; // default = 3, minimum = 1,
  position: "top" | "bottom"; // default = 'top', enum: ['top', 'bottom']
}

interface NotificationActionPayload {
  type: NotieAlertTypes;
  message: string;
  title?: string;
  options?: NotieAlertOptions;
}

export interface NotificationAction {
  type: symbol;
  payload: NotificationActionPayload;
}

const defaultNotieOptions = {
  time: 4,
  position: "bottom",
  stay: false
};

const ReduxNotifier: Middleware = () => next => (action: any) => {
  if (
    !EnvChecker.isOnServer() &&
    action.type === alertNotification.toString()
  ) {
    const notificationAction: NotificationAction = action;
    const notificationOptions = {
      ...defaultNotieOptions,
      ...notificationAction.payload.options
    };

    notie.alert({
      type: notificationAction.payload.type,
      text: notificationAction.payload.message,
      stay: notificationOptions.stay,
      time: notificationOptions.time,
      position: notificationOptions.position
    });
  } else if (action.type === clearNotification.toString()) {
    notie.hideAlerts();
  }

  return next(action);
};

export default ReduxNotifier;
