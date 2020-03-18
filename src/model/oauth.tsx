import { OAUTH_VENDOR } from "../constants/auth";

export interface MemberOAuth {
  connected: boolean;
  oauthId: string;
  userData: {};
  uuid: string;
  vendor: OAUTH_VENDOR | null;
}
