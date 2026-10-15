/** The AI guide conversation. Kept in memory only: it's gone when the app closes. */
import { create } from 'zustand';

import type { Turn } from '@/lib/api';

export type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  kind: 'normal' | 'crisis' | 'emergency' | 'error';
  /** Kept out of the turns sent to the server (local safety replies and errors). */
  local?: boolean;
};

type GuideState = {
  messages: Message[];
  busy: boolean;
  add: (m: Omit<Message, 'id'>) => void;
  setBusy: (busy: boolean) => void;
  clear: () => void;
  turns: () => Turn[];
  transcript: () => string;
};

let nextId = 1;

export const useGuide = create<GuideState>()((set, get) => ({
  messages: [],
  busy: false,
  add: m => set(s => ({ messages: [...s.messages, { ...m, id: nextId++ }].slice(-60) })),
  setBusy: busy => set({ busy }),
  clear: () => set({ messages: [], busy: false }),
  turns: () =>
    get()
      .messages.filter(m => m.kind !== 'error')
      .map(m => ({ role: m.role, content: m.text })),
  transcript: () =>
    get()
      .messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`)
      .join('\n\n')
      .slice(0, 6000),
}));
