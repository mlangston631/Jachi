/**
 * Calls to jachihealth.com: the AI guide (/api/chat) and Netlify Forms (waitlist and support tickets).
 * No health data is ever sent: the journal never leaves the phone.
 */
import { Platform } from 'react-native';

import { SITE } from './content';

export type ApiCode = 'offline' | 'timeout' | 'rate_limited' | 'unavailable' | 'rejected';

export class ApiError extends Error {
  constructor(public code: ApiCode, public status = 0) {
    super(code);
    this.name = 'ApiError';
  }
}

export async function request(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const { timeoutMs = 20_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } catch {
    throw new ApiError(controller.signal.aborted ? 'timeout' : 'offline');
  } finally {
    clearTimeout(timer);
  }
}

export type Turn = { role: 'user' | 'assistant'; content: string };

/** Ask the AI guide. The last 12 turns go to the server, which keeps the same rules as the website's chat. */
export async function askGuide(turns: Turn[]): Promise<string> {
  const res = await request(`${SITE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ messages: turns.slice(-12), surface: 'app' }),
    timeoutMs: 35_000,
  });
  if (res.status === 429) throw new ApiError('rate_limited', 429);
  if (!res.ok) throw new ApiError('unavailable', res.status);
  const data: unknown = await res.json().catch(() => null);
  const reply = data && typeof (data as { reply?: unknown }).reply === 'string' ? (data as { reply: string }).reply.trim() : '';
  if (!reply) throw new ApiError('unavailable', res.status);
  return reply;
}

export function encodeForm(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&');
}

/** Submit a Netlify form the same way the website does. */
export async function postForm(fields: Record<string, string>): Promise<void> {
  const res = await request(`${SITE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' },
    body: encodeForm(fields),
  });
  if (res.status === 429) throw new ApiError('rate_limited', 429);
  if (res.status >= 400 && res.status < 500) throw new ApiError('rejected', res.status);
  if (!res.ok) throw new ApiError('unavailable', res.status);
}

export const SOURCE = `app-${Platform.OS}`;
