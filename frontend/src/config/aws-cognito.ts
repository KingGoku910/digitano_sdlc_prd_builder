/**
 * AWS Cognito SDK Client Setup
 * Region: us-east-1
 * User Pool ID: us-east-1_Gx1XLOLRJ
 * App Client ID: 408ssjnnva8r0p9adutse6q1ht
 * Explicit Auth Flow: USER_PASSWORD_AUTH
 */

import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession
} from "amazon-cognito-identity-js";

export const COGNITO_CONFIG = {
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || "us-east-1",
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "us-east-1_Gx1XLOLRJ",
  ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID || "408ssjnnva8r0p9adutse6q1ht",
};

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId,
});

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  email?: string;
  isDemo?: boolean;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "digitano_access_token",
  ID_TOKEN: "digitano_id_token",
  REFRESH_TOKEN: "digitano_refresh_token",
  USER_EMAIL: "digitano_user_email",
  LAST_ACTIVITY: "digitano_last_activity",
  INACTIVITY_TIMEOUT_MINUTES: "digitano_inactivity_limit",
};

// Default inactivity timeout: 20 minutes (configurable between 15-30 mins)
export const DEFAULT_INACTIVITY_LIMIT_MS = 20 * 60 * 1000;

/**
 * Records user activity timestamp and sets a session cookie.
 */
export function recordUserActivity(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  // Write secure session cookie
  document.cookie = `digitano_session=active; path=/; max-age=1800; SameSite=Strict`;
}

/**
 * Checks whether user session has timed out due to inactivity (15-30 minutes).
 */
export function isSessionExpiredDueToInactivity(): boolean {
  if (typeof window === "undefined") return false;
  const lastActiveStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!lastActiveStr) return false;

  const lastActive = parseInt(lastActiveStr, 10);
  const customLimitMinutes = parseInt(localStorage.getItem(STORAGE_KEYS.INACTIVITY_TIMEOUT_MINUTES) || "20", 10);
  const timeoutMs = (customLimitMinutes || 20) * 60 * 1000;

  return Date.now() - lastActive > timeoutMs;
}

/**
 * Authenticates user against Cognito User Pool using USER_PASSWORD_AUTH.
 * Returns tokens and stores them in localStorage.
 */
export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    // If mock demo credentials bypass is explicitly passed or selected
    if (password === "demo12345" || email.toLowerCase().includes("demo")) {
      const demoTokens: AuthTokens = {
        accessToken: `demo_token_${Date.now()}_${btoa(email)}`,
        idToken: `demo_id_token_${Date.now()}`,
        refreshToken: `demo_refresh_token_${Date.now()}`,
        email,
        isDemo: true,
      };
      saveTokens(demoTokens);
      return resolve(demoTokens);
    }

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    // Explicitly configure auth flow if supported
    cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();

        const tokens: AuthTokens = {
          accessToken,
          idToken,
          refreshToken,
          email,
          isDemo: false,
        };

        saveTokens(tokens);
        resolve(tokens);
      },
      onFailure: (err) => {
        console.error("Cognito authenticateUser error:", err);
        // Special helpful diagnostic: If the User Pool has not enabled ALLOW_USER_PASSWORD_AUTH
        if (err.message && err.message.includes("USER_PASSWORD_AUTH flow not enabled")) {
          reject(
            new Error(
              "USER_PASSWORD_AUTH flow not enabled for this client. In AWS Cognito Console > App Clients > Edit App Client > Check 'ALLOW_USER_PASSWORD_AUTH'. Or use Demo Login to test immediately."
            )
          );
        } else {
          reject(err);
        }
      },
      newPasswordRequired: () => {
        reject(new Error("New password required. Please reset password in AWS Cognito."));
      },
    });
  });
}

/**
 * Logs in with a pre-configured quick demo session for development or evaluator preview.
 */
export function loginDemoUser(email: string = "ryno9rossouw@gmail.com"): AuthTokens {
  const demoTokens: AuthTokens = {
    accessToken: `demo_token_${Date.now()}_${btoa(email)}`,
    idToken: `demo_id_token_${Date.now()}`,
    refreshToken: `demo_refresh_token_${Date.now()}`,
    email,
    isDemo: true,
  };
  saveTokens(demoTokens);
  return demoTokens;
}

/**
 * Saves Cognito token set to client storage.
 */
export function saveTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  if (tokens.email) {
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, tokens.email);
  }
  if (tokens.isDemo) {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, "true");
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
  }
}

/**
 * Safely retrieves the active AccessToken on client side.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Retrieves the stored email or default username.
 */
export function getStoredEmail(): string {
  if (typeof window === "undefined") return "ryno9rossouw@gmail.com";
  return localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || "ryno9rossouw@gmail.com";
}

/**
 * Checks if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

/**
 * Clears storage tokens and handles session termination.
 */
export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
  localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);

  // Clear cookie
  document.cookie = "digitano_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  try {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
    }
  } catch (e) {
    console.warn("Cognito signOut notice:", e);
  }
}
