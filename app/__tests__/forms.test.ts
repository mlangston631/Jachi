import { encodeForm } from '@/lib/api';
import { ticketFields, waitlistFields } from '@/lib/form-fields';
import { codeFor } from '@/lib/identity-codes';

describe('website forms', () => {
  test('waitlist fields match the early-access form', () => {
    expect(waitlistFields({ email: ' a@b.co ', state: 'TX', name: 'Ana', interests: ['urgent-care', 'refills'], language: 'es', source: 'app-ios' })).toEqual({
      'form-name': 'early-access', 'bot-field': '', email: 'a@b.co', state: 'TX', first_name: 'Ana', interest: 'urgent-care, refills', language: 'es', source: 'app-ios',
    });
  });

  test('ticket fields match the support-ticket form, with English topics', () => {
    const f = ticketFields({ name: 'Ana', email: 'a@b.co', topic: 3, message: 'The app froze', transcript: '', device: 'Jachi app 1.0.0 (1), ios 26', language: 'es', source: 'app-ios' });
    expect(f['form-name']).toBe('support-ticket');
    expect(f.topic).toBe('Website problem');
    expect(f.include_chat).toBe('');
    expect(f.message).toContain('Jachi app 1.0.0');
  });

  test('form encoding', () => {
    expect(encodeForm({ 'form-name': 'x', msg: 'a b&c=d' })).toBe('form-name=x&msg=a+b%26c%3Dd');
  });

  test('identity error codes', () => {
    expect(codeFor(400, '', { error: 'invalid_grant' })).toBe('invalid_login');
    expect(codeFor(422, 'A user with this email address has already been registered', null)).toBe('exists');
    expect(codeFor(401, 'Email not confirmed', null)).toBe('unconfirmed');
    expect(codeFor(429, '', null)).toBe('rate');
    expect(codeFor(422, 'Password should be at least 8 characters', null)).toBe('weak_password');
    expect(codeFor(500, 'boom', null)).toBe('unknown');
  });
});
