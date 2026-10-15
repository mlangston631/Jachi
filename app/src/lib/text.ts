/** Split assistant text into plain parts and tappable phone numbers or the support email. */
export type Part = { kind: 'text' | 'tel' | 'sms' | 'email'; value: string };

export function linkify(text: string, email: string): Part[] {
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped}|\\b911\\b|\\b988\\b)`);
  return String(text)
    .split(re)
    .filter(Boolean)
    .map(part => {
      if (part === email) return { kind: 'email' as const, value: part };
      if (part === '911' || part === '988') return { kind: 'tel' as const, value: part };
      return { kind: 'text' as const, value: part };
    });
}

export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim()) && value.trim().length <= 254;
}

/** Collapse whitespace and cut to a length, for names and short fields. */
export function clean(value: string, max: number): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}
