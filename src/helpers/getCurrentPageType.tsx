import EnvChecker from "./envChecker";
import {
  HOME_PATH,
  SEARCH_RESULT_PATH,
  AUTHOR_SEARCH_RESULT_PATH,
  TERMS_OF_SERVICE_PATH,
  PRIVACY_POLICY_PATH,
  PAPER_SHOW_PATH,
  COLLECTION_SHOW_PATH,
  JOURNAL_SHOW_PATH,
  AUTHOR_SHOW_PATH,
  COLLECTION_LIST_PATH,
  AUTH_PATH,
  KEYWORD_SETTINGS_PATH
} from "../constants/route";
import { PageType } from "../constants/actionTicket";

export function getCurrentPageType(): PageType {
  if (!EnvChecker.isOnServer()) {
    const { pathname } = window.location;

    if (pathname === HOME_PATH) {
      return "home";
    } else if (pathname === SEARCH_RESULT_PATH) {
      return "searchResult";
    } else if (pathname === AUTHOR_SEARCH_RESULT_PATH) {
      return "authorSearchResult";
    } else if (pathname === TERMS_OF_SERVICE_PATH) {
      return "terms";
    } else if (pathname === PRIVACY_POLICY_PATH) {
      return "privacyPolicy";
    } else if (pathname.startsWith(`/${PAPER_SHOW_PATH.split("/")[1]}`)) {
      return "paperShow";
    } else if (pathname.startsWith(`/${COLLECTION_SHOW_PATH.split("/")[1]}`)) {
      return "collectionShow";
    } else if (pathname.startsWith(`/${JOURNAL_SHOW_PATH.split("/")[1]}`)) {
      return "journalShow";
    } else if (pathname.startsWith(`/${AUTHOR_SHOW_PATH.split("/")[1]}`)) {
      return "authorShow";
    } else if (
      pathname.startsWith(`/${COLLECTION_LIST_PATH.split("/")[1]}`) &&
      pathname.endsWith(COLLECTION_LIST_PATH.split("/")[3])
    ) {
      return "collectionList";
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith("sign_in")) {
      return "signIn";
    } else if (pathname.startsWith(AUTH_PATH) && pathname.endsWith("sign_up")) {
      return "signUp";
    } else if (
      pathname.startsWith(AUTH_PATH) &&
      pathname.endsWith("reset-password")
    ) {
      return "resetPassword";
    } else if (
      pathname.startsWith(AUTH_PATH) &&
      pathname.endsWith("email_verification")
    ) {
      return "emailVerification";
    } else if (pathname === KEYWORD_SETTINGS_PATH) {
      return "keywordSettingPage";
    }

    return "unknown";
  }

  return "unknown";
}
