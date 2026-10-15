/** Turn Netlify Identity's messages into codes the app explains in plain words (same rules as the website). */
export type IdentityCode =
  | 'rate' | 'unconfirmed' | 'exists' | 'signup_off' | 'invalid_login' | 'needs_password' | 'weak_password'
  | 'bad_email' | 'signed_out' | 'not_found' | 'network' | 'unknown';

export function codeFor(status: number, message: string, body: unknown): IdentityCode {
  const m = String(message || '').toLowerCase();
  if (status === 429) return 'rate';
  if (m.includes('not confirmed')) return 'unconfirmed';
  if (m.includes('already') && m.includes('registered')) return 'exists';
  if (m.includes('signups not allowed') || (m.includes('signup') && m.includes('disabled'))) return 'signup_off';
  if (body && typeof body === 'object' && (body as { error?: unknown }).error === 'invalid_grant') return 'invalid_login';
  if (m.includes('invited') && m.includes('password')) return 'needs_password';
  if (m.includes('password')) return 'weak_password';
  if (m.includes('email') && (m.includes('valid') || m.includes('format'))) return 'bad_email';
  if (status === 401 || status === 403) return 'signed_out';
  if (status === 404) return 'not_found';
  return 'unknown';
}
