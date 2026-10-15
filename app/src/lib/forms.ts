/**
 * The waitlist and support-ticket forms. When the phone is offline, the submission waits in the outbox and is
 * sent the next time the app opens with a connection.
 */
import { usePrefs } from '@/state/prefs';
import { ApiError, postForm } from './api';
import { bumpTries, dequeue, outbox, queue } from './db';

export * from './form-fields';

export type SendResult = 'sent' | 'queued';

/** Send now; if the phone is offline, keep it in the outbox. Other failures are thrown. */
export async function sendOrQueue(kind: 'waitlist' | 'ticket', fields: Record<string, string>): Promise<SendResult> {
  try {
    await postForm(fields);
    return 'sent';
  } catch (err) {
    if (err instanceof ApiError && (err.code === 'offline' || err.code === 'timeout')) {
      await queue(kind, fields);
      return 'queued';
    }
    throw err;
  }
}

let flushing = false;

/** Send anything waiting in the outbox. Safe to call often. */
export async function flushOutbox(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    for (const item of await outbox()) {
      let fields: Record<string, string>;
      try {
        fields = JSON.parse(item.body) as Record<string, string>;
      } catch {
        await dequeue(item.id);
        continue;
      }
      try {
        await postForm(fields);
        await dequeue(item.id);
        if (item.kind === 'waitlist') {
          const w = usePrefs.getState().waitlist;
          if (w && w.email === fields.email) usePrefs.getState().set({ waitlist: { ...w, queued: false } });
        }
      } catch (err) {
        if (err instanceof ApiError && err.code === 'rejected') {
          await dequeue(item.id);
        } else {
          await bumpTries(item.id);
          if (err instanceof ApiError && (err.code === 'offline' || err.code === 'timeout')) break;
        }
      }
    }
  } catch {
    // The outbox will be tried again next time.
  } finally {
    flushing = false;
  }
}
