import { Member } from '@src/model/member';
import { Institute } from '@src/model/Institute';

export interface SignInResult {
  loggedIn: boolean;
  oauthLoggedIn: boolean;
  token: string;
  member: Member | null;
  ipInstitute: Institute | null;
}

export type OAUTH_VENDOR = 'ORCID' | 'FACEBOOK' | 'GOOGLE';

export interface OAuthCheckParams {
  email?: string | null;
  firstName: string;
  lastName: string;
  token: string;
  vendor: OAUTH_VENDOR;
}
