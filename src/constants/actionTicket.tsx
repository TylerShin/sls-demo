export const MAXIMUM_TICKET_COUNT_IN_QUEUE = 5;
export const TIME_INTERVAL_TO_SEND_TICKETS = 1000 * 5;
export const DEVICE_ID_KEY = "d_id";
export const DEVICE_ID_INITIALIZED_KEY = "d_id_i";
export const SESSION_ID_KEY = "s_id";
export const SESSION_ID_INITIALIZED_KEY = "s_id_i";
export const SESSION_COUNT_KEY = "s_c";
export const USER_ID_KEY = "u_id";
export const TICKET_QUEUE_KEY = "a_q";
export const DEAD_LETTER_QUEUE_KEY = "d_a_q";
export const LIVE_SESSION_LENGTH = 1000 * 60 * 30;
export const MAXIMUM_RETRY_COUNT = 3;
export const DESTINATION_URL =
  "https://1cgir0gy5d.execute-api.us-east-1.amazonaws.com/prod/actionticket";
