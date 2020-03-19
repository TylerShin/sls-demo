import { AxiosInstance } from 'axios';
import { SignInResult } from './types/auth';

export async function checkAuthStatus(axios: AxiosInstance): Promise<SignInResult> {
  const checkLoggedInResponse = await axios.get('/auth/login');
  const res: SignInResult = checkLoggedInResponse.data;

  return res;
}
