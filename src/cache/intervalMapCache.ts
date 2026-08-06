import { ICacheObject } from '../_reReselect';

interface CacheEntry {
  data: unknown;
  time: number;
}

/**
 * Buckets used to live in a module-level `Record<string, …>` keyed by an
 * incrementing numeric id, which meant every `get` and `set` coerced that number to
 * a string and re-read the global record — four times per cache hit in `get`.
 * Holding the entries on the instance removes both, and a `Map` keeps non-string
 * keys as they are instead of stringifying them.
 */
const buckets = new Set<IntervalMapCache>();

const cacheLifetime = 10000;

let garbageCollectorStarted = false;

const runGarbageCollector = () => {
  const currentTime = Date.now();

  buckets.forEach((bucket) => {
    bucket.sweep(currentTime);
  });

  window.setTimeout(runGarbageCollector, cacheLifetime);
};

export const initGarbageCollector = () => {
  if (garbageCollectorStarted) {
    return;
  }

  if (typeof window !== 'undefined') {
    garbageCollectorStarted = true;
    window.setTimeout(runGarbageCollector, cacheLifetime);
  }
};

export class IntervalMapCache implements ICacheObject {
  private entries = new Map<unknown, CacheEntry>();

  constructor() {
    buckets.add(this);
  }

  public set(key: any, data: any) {
    const entry = this.entries.get(key);

    if (entry === undefined) {
      this.entries.set(key, { data, time: Date.now() });
    } else {
      entry.data = data;
      entry.time = Date.now();
    }
  }

  public get(key: any) {
    const entry = this.entries.get(key);

    if (entry === undefined) {
      return undefined;
    }

    entry.time = Date.now();

    return entry.data;
  }

  public remove(key: any) {
    this.entries.delete(key);
  }

  public clear() {
    this.entries.clear();
  }

  /**
   * Drops entries untouched for longer than the lifetime. Called by the collector
   * rather than by the cache itself, so the sweep stays one pass over every bucket.
   */
  public sweep(currentTime: number) {
    this.entries.forEach((entry, key) => {
      if (currentTime - entry.time > cacheLifetime) {
        this.entries.delete(key);
      }
    });
  }
}
