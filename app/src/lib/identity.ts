/**
 * Accounts, through Netlify Identity on jachihealth.com, exactly like the website's account page.
 * Accounts hold waitlist details only (state, services, language, emails on or off), never health data.
 * The session lives in the phone's secure storage (Keychain on iPhone, Keystore on Android).
 */
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

import { request, ApiError } from './api';
import { codeFor, type IdentityCode } from './identity-codes';
import { SITE } from './content';

const BASE = `${SITE}/.netlify/identity`;
const KEY = 'jachi.session';
const SECURE: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export class IdentityError extends Error {
  constructor(public status: number, public code: IdentityCode | string, message = '') {
    super(message || code);
    this.name = 'IdentityError';
  }
}

const Meta = z.object({
  state: z.string().optional().catch(undefined),
  interests: z.array(z.string()).optional().catch(undefined),
  language: z.string().optional().catch(undefined),
  updates: z.boolean().optional().catch(undefined),
}).passthrough();

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  confirmed_at: z.string().nullish(),
  user_metadata: Meta.nullish(),
});
export type User = z.infer<typeof UserSchema>;
export type Details = { state: string; interests: string[]; language: 'en' | 'es'; updates: boolean };

const Tokens = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  expires_at: z.number().optional(),
});
type Session = { access_token: string; refresh_token: string; expires_at: number };

type Opts = { method?: string; token?: string; json?: unknown; form?: Record<string, string> };

async function call(url: string, { method = 'GET', token, json, form }: Opts = {}): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: string | undefined;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = Object.entries(form).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await request(url, { method, headers, body });
  } catch (err) {
    throw new IdentityError(0, err instanceof ApiError && err.code === 'timeout' ? 'network' : 'network');
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const d = (data ?? {}) as Record<string, unknown>;
    const message = String(d.msg ?? d.error_description ?? d.message ?? '');
    throw new IdentityError(res.status, codeFor(res.status, message, data), message);
  }
  return data;
}

const now = () => Math.floor(Date.now() / 1000);

async function readSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY, SECURE);
    if (!raw) return null;
    const v = JSON.parse(raw) as Session;
    return v && typeof v.access_token === 'string' ? v : null;
  } catch {
    return null;
  }
}

async function writeSession(session: Session | null): Promise<void> {
  try {
    if (session) await SecureStore.setItemAsync(KEY, JSON.stringify(session), SECURE);
    else await SecureStore.deleteItemAsync(KEY, SECURE);
  } catch {
    // Secure storage unavailable: the person will need to log in again next time.
  }
}

async function keep(raw: unknown): Promise<Session> {
  const t = Tokens.parse(raw);
  const session = {
    access_token: t.access_token,
    refresh_token: t.refresh_token ?? '',
    expires_at: t.expires_at ?? now() + (t.expires_in ?? 3600),
  };
  await writeSession(session);
  return session;
}

let refreshing: Promise<string | null> | null = null;

/** A valid access token, refreshed when it's about to expire. null when nobody is signed in. */
export async function accessToken(): Promise<string | null> {
  const session = await readSession();
  if (!session) return null;
  if (session.expires_at - now() > 60) return session.access_token;
  if (!session.refresh_token) {
    await writeSession(null);
    return null;
  }
  refreshing ??= call(`${BASE}/token`, { method: 'POST', form: { grant_type: 'refresh_token', refresh_token: session.refresh_token } })
    .then(async raw => (await keep(raw)).access_token)
    .catch(async (err: unknown) => {
      if (err instanceof IdentityError && err.status > 0 && err.status < 500) {
        await writeSession(null);
        return null;
      }
      throw err;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function currentUser(): Promise<User | null> {
  const token = await accessToken();
  if (!token) return null;
  try {
    return UserSchema.parse(await call(`${BASE}/user`, { token }));
  } catch (err) {
    if (err instanceof IdentityError && [401, 403, 404].includes(err.status)) {
      await writeSession(null);
      return null;
    }
    throw err;
  }
}

export async function signup(email: string, password: string, data: Details): Promise<User> {
  return UserSchema.parse(await call(`${BASE}/signup`, { method: 'POST', json: { email, password, data } }));
}

export async function login(email: string, password: string): Promise<User | null> {
  await keep(await call(`${BASE}/token`, { method: 'POST', form: { grant_type: 'password', username: email, password } }));
  return currentUser();
}

export async function recover(email: string): Promise<void> {
  await call(`${BASE}/recover`, { method: 'POST', json: { email } });
}

export async function updateDetails(details: Details): Promise<User> {
  const token = await accessToken();
  if (!token) throw new IdentityError(401, 'signed_out');
  return UserSchema.parse(await call(`${BASE}/user`, { method: 'PUT', token, json: { data: details } }));
}

export async function changePassword(password: string): Promise<User> {
  const token = await accessToken();
  if (!token) throw new IdentityError(401, 'signed_out');
  return UserSchema.parse(await call(`${BASE}/user`, { method: 'PUT', token, json: { password } }));
}

export async function logout(): Promise<void> {
  const session = await readSession();
  await writeSession(null);
  if (session?.access_token) {
    try {
      await call(`${BASE}/logout`, { method: 'POST', token: session.access_token });
    } catch {
      // Already signed out on the server.
    }
  }
}

/** Delete the account (and, when the email was proved, its waitlist sign-ups and tickets). */
export async function deleteAccount(): Promise<{ forms: string }> {
  const token = await accessToken();
  if (!token) throw new IdentityError(401, 'signed_out');
  const data = (await call(`${SITE}/api/account/delete`, { method: 'POST', token })) as { forms?: unknown } | null;
  await writeSession(null);
  return { forms: typeof data?.forms === 'string' ? data.forms : 'skipped' };
}

export function detailsOf(user: User | null): Details | null {
  if (!user) return null;
  const m = user.user_metadata ?? {};
  return {
    state: typeof m.state === 'string' ? m.state : '',
    interests: Array.isArray(m.interests) ? m.interests : [],
    language: m.language === 'es' ? 'es' : 'en',
    updates: m.updates !== false,
  };
}
