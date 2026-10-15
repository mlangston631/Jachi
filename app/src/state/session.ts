/** The signed-in waitlist account, if any. Loaded from secure storage at launch; never holds health data. */
import { create } from 'zustand';

import { currentUser, logout as identityLogout, type User } from '@/lib/identity';

type SessionState = {
  status: 'unknown' | 'signedOut' | 'signedIn';
  user: User | null;
  setUser: (user: User | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useSession = create<SessionState>()(set => ({
  status: 'unknown',
  user: null,
  setUser: user => set({ user, status: user ? 'signedIn' : 'signedOut' }),
  refresh: async () => {
    try {
      const user = await currentUser();
      set({ user, status: user ? 'signedIn' : 'signedOut' });
    } catch {
      // Offline: keep what we know; the account screen can retry.
      set(s => (s.status === 'unknown' ? { status: 'signedOut' } : s));
    }
  },
  logout: async () => {
    await identityLogout();
    set({ user: null, status: 'signedOut' });
  },
}));
