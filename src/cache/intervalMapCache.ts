import { ICacheObject } from '@veksa/re-reselect';

const cache: Record<string, Record<string, { data: object; time: number }>> = {};

let cacheItemCounter = 0;

const cacheLifetime = 10000;

const runGarbageCollector = () => {
  const currentTime = new Date().getTime();

  const ids = Object.keys(cache);

  for (let i = 0; i < ids.length; i++) {
    const keys = Object.keys(ids[i]);

    for (let j = 0; j < keys.length; j++) {
      if (cache[ids[i]][keys[j]]) {
        if ((currentTime - cache[ids[i]][keys[j]].time) > cacheLifetime) {
          delete cache[ids[i]][keys[j]];
        }
      }
    }
  }

  window.setTimeout(() => {
    runGarbageCollector();
  }, cacheLifetime);
};

export const initGarbageCollector = () => {
  if (typeof window !== 'undefined') {
    window.setTimeout(runGarbageCollector, cacheLifetime);
  }
};

export class IntervalMapCache implements ICacheObject {
  private id = cacheItemCounter++;

  private date = new Date();

  public set(key: any, data: any) {
    if (cache[this.id] === undefined) {
      cache[this.id] = {};
    }

    cache[this.id][key] = {
      data,
      time: this.date.getTime(),
    };
  }

  public get(key: any) {
    if (cache[this.id] === undefined) {
      cache[this.id] = {};
    }

    if (cache[this.id][key] !== undefined) {
      cache[this.id][key].time = this.date.getTime();

      return cache[this.id][key].data;
    }

    return undefined;
  }

  public remove(key: any) {
    delete cache[this.id][key];
  }

  public clear() {
    delete cache[this.id];
  }
}
