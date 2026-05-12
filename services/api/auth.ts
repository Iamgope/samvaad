import { api } from './client';
import { tokens } from './tokens';

// ── Types ────────────────────────────────────────────────────────────────────

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type AuthResponse = AuthTokens & {
  is_new_user?: boolean;
};

type ApiEnvelope<T> = {
  message?: string;
  data: T;
};

// ── Internal ─────────────────────────────────────────────────────────────────

async function storeTokens(t: AuthTokens): Promise<void> {
  await tokens.setAccess(t.access_token);
  await tokens.setRefresh(t.refresh_token);
}

// ── Phone OTP ────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  await api.post('/authentication/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/authentication/otp/verify', { phone, code });
  await storeTokens(res.data);
  return res.data;
}

// ── Google ───────────────────────────────────────────────────────────────────

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/authentication/oauth/google/callback/', {
    id_token: idToken,
  });
  await storeTokens(res.data);
  return res.data;
}

// ── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(username: string, topics: string[]): Promise<void> {
  await api.post('/authentication/onboarding', { username, topics });
}

// ── Session ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const refresh_token = await tokens.getRefresh();
  try {
    await api.post('/authentication/logout', { refresh_token });
  } finally {
    await tokens.clear();
  }
}
