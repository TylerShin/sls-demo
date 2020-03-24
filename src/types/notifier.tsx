export type NotieAlertTypes = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface NotieAlertOptions {
  text: string;
  stay: boolean; // default = false
  time: number; // default = 3, minimum = 1,
  position: 'top' | 'bottom'; // default = 'top', enum: ['top', 'bottom']
}

export interface NotificationActionPayload {
  type: NotieAlertTypes;
  message: string;
  title?: string;
  options?: NotieAlertOptions;
}

export interface NotificationAction {
  type: symbol;
  payload: NotificationActionPayload;
}
