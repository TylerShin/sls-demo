import { Member } from "./member";
import { Institute } from "./Institute";

export interface CurrentUser
  extends Member,
    Readonly<{
      isLoggedIn: boolean;
      oauthLoggedIn: boolean;
      isLoggingIn: boolean;
      ipInstitute: Institute | null;
    }> {}
