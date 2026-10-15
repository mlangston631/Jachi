/** The exact fields the website's Netlify forms expect (early-access waitlist and support ticket). */
export type WaitlistInput = { email: string; state: string; name: string; interests: string[]; language: 'en' | 'es'; source: string };

export function waitlistFields(w: WaitlistInput): Record<string, string> {
  return {
    'form-name': 'early-access',
    'bot-field': '',
    email: w.email.trim(),
    state: w.state,
    first_name: w.name.trim(),
    interest: w.interests.join(', '),
    language: w.language,
    source: w.source,
  };
}

export const TICKET_TOPICS = ['General question', 'Early access', 'Services and prices', 'Website problem', 'Partnerships or press', 'Something else'] as const;

export type TicketInput = {
  name: string;
  email: string;
  topic: number;
  message: string;
  transcript: string;
  device: string;
  language: 'en' | 'es';
  source: string;
};

export function ticketFields(t: TicketInput): Record<string, string> {
  const message = t.device ? `${t.message.trim()}\n\n---\n${t.device}` : t.message.trim();
  return {
    'form-name': 'support-ticket',
    'bot-field': '',
    name: t.name.trim(),
    email: t.email.trim(),
    topic: TICKET_TOPICS[t.topic] ?? TICKET_TOPICS[0],
    message,
    include_chat: t.transcript ? 'yes' : '',
    chat_transcript: t.transcript,
    language: t.language,
    source: t.source,
  };
}

