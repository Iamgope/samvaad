import { api } from './client';
import { tokens } from './tokens';

// ── Types ────────────────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  isNewUser: boolean;
};

// ── Internal ─────────────────────────────────────────────────────────────────

async function storeTokens(t: AuthTokens): Promise<void> {
  await tokens.setAccess(t.accessToken);
  await tokens.setRefresh(t.refreshToken);
}

// ── Phone OTP ────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  await api.post('/authentication/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/authentication/otp/verify', { phone, code });
  await storeTokens(res);
  return res;
}

// ── Google ───────────────────────────────────────────────────────────────────

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/authentication/google', { idToken });
  await storeTokens(res);
  return res;
}

// ── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(username: string, topics: string[]): Promise<void> {
  await api.post('/authentication/onboarding', { username, topics });
}

// ── Session ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const refreshToken = await tokens.getRefresh();
  try {
    await api.post('/authentication/logout', { refreshToken });
  } finally {
    // Always clear locally even if the server call fails
    await tokens.clear();
  }
}
