import { SearchError } from './errors';

type Entry = { signal: AbortSignal; start(): void; abort(): void };
/** Process-scoped leases cover underlying work, even when an aborted caller stops waiting. */
export class BoundedPool {
  private active = 0;
  private queue: Entry[] = [];
  constructor(private readonly maximum: number, private readonly queueLimit: number) {}
  run<T>(signal: AbortSignal, work: () => Promise<T>): Promise<T> {
    if (signal.aborted) return Promise.reject(signal.reason);
    if (this.active >= this.maximum && this.queue.length >= this.queueLimit) return Promise.reject(new SearchError('SEARCH_BUSY'));
    return new Promise<T>((resolve, reject) => {
      let settled = false;
      const complete = (value: T | undefined, error?: unknown) => {
        if (settled) return;
        settled = true; signal.removeEventListener('abort', entry.abort);
        if (error !== undefined) reject(error); else resolve(value as T);
      };
      const entry: Entry = { signal,
        abort: () => { const index = this.queue.indexOf(entry); if (index >= 0) this.queue.splice(index, 1); complete(undefined, signal.reason); },
        start: () => {
          if (signal.aborted) { entry.abort(); this.drain(); return; }
          this.active++;
          let task: Promise<T>;
          try { task = work(); } catch (error) { task = Promise.reject(error); }
          void task.then(value => complete(value), error => complete(undefined, error)).finally(() => { this.active--; this.drain(); });
        },
      };
      signal.addEventListener('abort', entry.abort, { once: true });
      if (signal.aborted) entry.abort();
      else if (this.active < this.maximum) entry.start();
      else this.queue.push(entry);
    });
  }
  private drain() {
    while (this.active < this.maximum && this.queue.length) this.queue.shift()!.start();
  }
}
export const sourcePool = new BoundedPool(2, 48);
export const modelPool = new BoundedPool(12, 24);

export function deadline(parent: AbortSignal, deadlineAt: number, now = Date.now) {
  const controller = new AbortController();
  const abort = () => controller.abort(parent.reason);
  const timer = setTimeout(() => controller.abort(new SearchError('SEARCH_TIMEOUT')), Math.max(0, deadlineAt - now()));
  parent.addEventListener('abort', abort, { once: true });
  if (parent.aborted) abort();
  return { signal: controller.signal, cancel: () => controller.abort(new SearchError('SEARCH_TIMEOUT')),
    dispose: () => { clearTimeout(timer); parent.removeEventListener('abort', abort); } };
}

export function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); reject(signal.reason); };
    signal.addEventListener('abort', abort, { once: true });
    void work.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
  });
}
