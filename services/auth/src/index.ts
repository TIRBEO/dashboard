import { OAuthProvider } from "@tirbeo/types";

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  enabled: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
  provider: OAuthProvider;
  providerId: string;
}

export interface OAuthState {
  nonce: string;
  redirect: string;
  provider: OAuthProvider;
}

export interface AuthResult {
  user: UserInfo;
  tokens: TokenPair;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}

export function validateRedirectUrl(url: string, allowedOrigins: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedOrigins.some(
      (origin) => parsed.origin === origin || parsed.hostname.endsWith(origin.replace(/^https?:\/\//, ""))
    );
  } catch {
    return false;
  }
}

export function generateState(nonce: string, redirect: string): string {
  const payload = JSON.stringify({ nonce, redirect });
  return Buffer.from(payload).toString("base64url");
}

export function verifyState(state: string): OAuthState | null {
  try {
    const payload = JSON.parse(Buffer.from(state, "base64url").toString());
    return payload as OAuthState;
  } catch {
    return null;
  }
}
