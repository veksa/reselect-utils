import { ICacheObject } from '../_reReselect';

const cache: Record<string, Record<string, { data: object; time: number }>> = {};

let cacheItemCounter = 0;

const cacheLifetime = 10000;

let garbageCollectorStarted = false;

const runGarbageCollector = () => {
  const currentTime = Date.now();

  const ids = Object.keys(cache);

  for (let i = 0; i < ids.length; i++) {
    const bucket = cache[ids[i]];
    const keys = Object.keys(bucket);

    for (let j = 0; j < keys.length; j++) {
      if (currentTime - bucket[keys[j]].time > cacheLifetime) {
        delete bucket[keys[j]];
      }
    }
  }

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
  private id = cacheItemCounter++;

  public set(key: any, data: any) {
    if (cache[this.id] === undefined) {
      cache[this.id] = {};
    }

    cache[this.id][key] = {
      data,
      time: Date.now(),
    };
  }

  public get(key: any) {
    if (cache[this.id] === undefined) {
      cache[this.id] = {};
    }

    if (cache[this.id][key] !== undefined) {
      cache[this.id][key].time = Date.now();

      return cache[this.id][key].data;
    }

    return undefined;
  }

  public remove(key: any) {
    if (cache[this.id] === undefined) {
      return;
    }

    delete cache[this.id][key];
  }

  public clear() {
    delete cache[this.id];
  }
}
