import { Member } from '@src/model/member';
import { Institute } from '@src/model/Institute';
import { AxiosInstance } from 'axios';

export interface SignInResult {
  loggedIn: boolean;
  oauthLoggedIn: boolean;
  token: string;
  member: Member | null;
  ipInstitute: Institute | null;
}

export async function checkAuthStatus(axios: AxiosInstance): Promise<SignInResult> {
  const checkLoggedInResponse = await axios.get('/auth/login');
  const res: SignInResult = checkLoggedInResponse.data;

  return res;
}
