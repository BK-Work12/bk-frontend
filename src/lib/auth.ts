import { apiFetch, ApiOk } from './api';

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  walletAddress?: string;
  preferredNetwork?: string;
  preferredCurrency?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postCode?: string;
  role?: string;
  /** Identity verification: none | pending | approved | failed. Step 3 complete when approved. */
  verificationStatus?: string;
  createdAt?: string;
};

/** Step 2 = Personal info + address filled in. Used for dashboard progress bar. */
export function isStep2Complete(user: PublicUser | null): boolean {
  if (!user) return false;
  const hasName = !!user.firstName?.trim() && !!user.lastName?.trim();
  const hasAddress =
    !!user.addressLine1?.trim() &&
    !!user.city?.trim() &&
    !!user.postCode?.trim();
  return hasName && hasAddress;
}

/** Step 3 = Identity verification approved. Used for dashboard gating and full access. */
export function isStep3Complete(user: PublicUser | null): boolean {
  return user?.verificationStatus === 'approved';
}

export type AuthResponse = {
  token: string;
  user: PublicUser;
};

export async function signup(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  ref?: string;
}) {
  const res = await apiFetch<ApiOk<AuthResponse>>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function login(payload: { email: string; password: string }) {
  const res = await apiFetch<ApiOk<AuthResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export function setToken(token: string) {
  localStorage.setItem('varntix_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('varntix_token');
}

export function clearToken(): void {
  localStorage.removeItem('varntix_token');
}

export async function fetchCurrentUser(): Promise<PublicUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await apiFetch<ApiOk<{ user: PublicUser }>>('/auth/me', {
      method: 'GET',
      token,
    });
    return res.data.user;
  } catch {
    return null;
  }
}

export type ProfileUpdatePayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  walletAddress?: string;
  preferredNetwork?: string;
  preferredCurrency?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postCode?: string;
};

export async function updateProfile(payload: ProfileUpdatePayload): Promise<PublicUser> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await apiFetch<ApiOk<{ user: PublicUser }>>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
  return res.data.user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch<ApiOk<unknown>>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function submitPasswordReset(payload: { token: string; password: string }): Promise<void> {
  await apiFetch<ApiOk<unknown>>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Step 1: Send OTP to phone. Phone should be digits with country code (e.g. 447123456789). */
export async function sendSignupOtp(payload: { email: string; phone: string }): Promise<void> {
  await apiFetch<ApiOk<unknown>>('/auth/send-signup-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Step 2: Verify OTP. Returns signupToken for complete-signup. */
export async function verifySignupOtp(payload: {
  email: string;
  phone: string;
  code: string;
}): Promise<{ signupToken: string }> {
  const res = await apiFetch<ApiOk<{ signupToken: string }>>('/auth/verify-signup-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** Get Sumsub Web SDK access token for identity verification. Requires auth. */
export async function getVerificationAccessToken(): Promise<{ token: string; applicantId: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await apiFetch<ApiOk<{ token: string; applicantId: string }>>('/auth/verification/access-token', {
    method: 'GET',
    token,
  });
  return res.data;
}

/** Step 3: Create account with signupToken + name, country, password. Returns auth token + user. */
export async function completeSignup(payload: {
  signupToken: string;
  firstName: string;
  lastName: string;
  country: string;
  password: string;
  ref?: string;
}) {
  const res = await apiFetch<ApiOk<AuthResponse>>('/auth/complete-signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** Request a nonce for wallet-based authentication (SIWE). */
export async function walletNonce(address: string): Promise<{ nonce: string }> {
  const res = await apiFetch<ApiOk<{ nonce: string }>>('/auth/wallet-nonce', {
    method: 'POST',
    body: JSON.stringify({ address }),
  });
  return res.data;
}

/** Authenticate via wallet signature. Returns JWT + user. Creates account if first-time. */
export async function walletLogin(payload: {
  address: string;
  message: string;
  signature: string;
}): Promise<AuthResponse> {
  const res = await apiFetch<ApiOk<AuthResponse>>('/auth/wallet-login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

