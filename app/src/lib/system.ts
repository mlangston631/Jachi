/**
 * Moments when the operating system covers the app (Face ID prompt, share sheet, permission dialogs).
 * The privacy cover stays hidden during these so the screen doesn't flash.
 */
let depth = 0;
const listeners = new Set<() => void>();

export function systemUIOpen(): boolean {
  return depth > 0;
}

export function onSystemUI(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function withSystemUI<T>(task: () => Promise<T>): Promise<T> {
  depth += 1;
  listeners.forEach(l => l());
  try {
    return await task();
  } finally {
    // The app becomes active again a moment after the system UI closes.
    setTimeout(() => {
      depth = Math.max(0, depth - 1);
      listeners.forEach(l => l());
    }, 600);
  }
}
