import { AxiosInstance } from 'axios';
import {
  SignInResult,
  OAUTH_VENDOR,
  OAuthCheckResult,
  SignUpWithSocialParams,
  SignUpWithEmailParams,
  SignInWithEmailParams,
  SignInData,
  VerifyEmailResult,
  UpdateUserInformationAPIParams,
  ChangePasswordParams,
  EmailSettingsResponse,
  UpdateEmailSettingParams,
  CheckDuplicatedEmailResult,
} from './types/auth';
import { Member } from '@src/model/member';
import PlutoAxios from './pluto';

export async function signOut(axios: AxiosInstance) {
  await axios.post('auth/logout');
}

export async function signUpWithSocial(params: SignUpWithSocialParams & { axios: AxiosInstance }): Promise<Member> {
  const signUpWithSocialResponse = await params.axios.post('/members/oauth', {
    email: params.email,
    token: params.token,
    first_name: params.firstName,
    last_name: params.lastName,
    affiliation_id: params.affiliationId,
    affiliation_name: params.affiliation,
    profile_link: params.profileLink || null,
  });

  const member = signUpWithSocialResponse.data;

  return {
    ...member,
    authorId: String(member.authorId),
  };
}

export async function checkAuthStatus(axios: AxiosInstance): Promise<SignInResult> {
  const checkLoggedInResponse = await axios.get('/auth/login');
  const res: SignInResult = checkLoggedInResponse.data;

  return res;
}

export async function checkOAuthStatus(
  axios: AxiosInstance,
  vendor: OAUTH_VENDOR,
  token: string
): Promise<OAuthCheckResult> {
  const res = await axios.post('/auth/oauth/check', { vendor, token });

  return res.data.data.content;
}

class AuthAPI extends PlutoAxios {
  public async signUpWithEmail(params: SignUpWithEmailParams): Promise<Member> {
    const signUpWithEmailResponse = await this.post('/members', {
      email: params.email,
      password: params.password,
      first_name: params.firstName,
      last_name: params.lastName,
      affiliation_id: params.affiliationId,
      affiliation_name: params.affiliation,
      profile_link: params.profileLink || null,
    });

    const member = signUpWithEmailResponse.data;

    return {
      ...member,
      authorId: String(member.authorId),
    };
  }

  public async signInWithEmail(userInfo: SignInWithEmailParams): Promise<SignInResult> {
    const signInWithEmailResponse = await this.post('/auth/login', {
      email: userInfo.email,
      password: userInfo.password,
    });
    const signInData: SignInData = signInWithEmailResponse.data;

    return {
      ...signInData,
      member: {
        ...signInData.member,
        authorId: String(signInData.member.authorId),
      },
    };
  }

  public async checkLoggedIn(): Promise<SignInResult> {
    const checkLoggedInResponse = await this.get('/auth/login');
    const checkLoggedInData: SignInData = checkLoggedInResponse.data;

    const signInData: SignInData = checkLoggedInData;

    if (!signInData.member) {
      return signInData;
    }

    return {
      ...signInData,
      member: {
        ...signInData.member,
        authorId: String(signInData.member.authorId),
      },
    };
  }

  public async verifyToken(token: string): Promise<VerifyEmailResult> {
    const verifyTokenResponse = await this.post('/email-verification', {
      token,
    });

    return verifyTokenResponse.data;
  }

  public async resendVerificationEmail(email: string): Promise<VerifyEmailResult> {
    const resendVerificationEmailResponse = await this.post('/email-verification/resend', {
      email,
    });

    return resendVerificationEmailResponse.data;
  }

  public async requestResetPasswordToken(email: string): Promise<{ success: boolean }> {
    const response = await this.post('/members/password-token', email);

    return response.data;
  }

  public async resetPassword(password: string, token: string): Promise<{ success: boolean }> {
    const response = await this.post('/members/reset-password', {
      password,
      token,
    });

    return response.data;
  }

  public async loginWithOAuth(vendor: OAUTH_VENDOR, token: string): Promise<SignInResult> {
    const res = await this.post('/auth/oauth/login', { vendor, token });
    const signInData: SignInData = res.data;

    return {
      ...signInData,
      member: {
        ...signInData.member,
        authorId: String(signInData.member.authorId),
      },
    };
  }

  public async update(params: UpdateUserInformationAPIParams): Promise<Member> {
    const res = await this.put('/members/me', params);
    const member = res.data;

    return {
      ...member,
      authorId: String(member.authorId),
    };
  }

  public async changePassword({ oldPassword, newPassword }: ChangePasswordParams) {
    await this.put('/members/me/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  public async getEmailSettings(token?: string): Promise<EmailSettingsResponse> {
    const res = await this.get(`/notifications/email/settings?token=${token}`);
    return res.data;
  }

  public async checkDuplicatedEmail(email: string): Promise<CheckDuplicatedEmailResult> {
    const checkDuplicatedEmailResponse = await this.get('/members/checkDuplication', {
      params: {
        email,
      },
    });

    return checkDuplicatedEmailResponse.data;
  }

  public async updateEmailSetting({
    token,
    type,
    setting,
  }: UpdateEmailSettingParams): Promise<{
    success: boolean;
  }> {
    const res = await this.put(`/notifications/email/settings?token=${token}`, {
      type,
      setting: setting ? 'ON' : 'OFF',
    });
    return res.data.data.content;
  }
}

const apiHelper = new AuthAPI();

export default apiHelper;
