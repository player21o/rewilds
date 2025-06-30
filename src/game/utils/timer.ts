export class Timer {
  private time = 0;
  private cleanup;

  constructor(cleanup = false) {
    this.cleanup = cleanup;
  }

  private every_timers: { [id: string]: { interval: number; last: number } } =
    {};
  private key_listeners: Map<object, { keys: any[]; last_values: object }> =
    new Map();

  public update(elapsedMS: number) {
    this.time += elapsedMS / 1000;

    if (this.cleanup && this.every(5, "cleanup")) {
      Object.keys(this.every_timers).forEach((timer_id) => {
        if (timer_id != "cleanup") {
          const timer = this.every_timers[timer_id];

          if (this.time - timer.last > timer.interval + 1) {
            this.remove_id(timer_id);
          }
        }
      });
    }
  }

  public on_key_change<T extends object>(object: T, key: keyof T): boolean {
    if (this.key_listeners.has(object)) {
      const vals = this.key_listeners.get(object)!;

      if (vals.keys.includes(key)) {
        //console.log(
        //  vals.last_values[key as keyof typeof vals.last_values],
        //  object[key],
        //  JSON.stringify(object)
        //);
        const changed =
          vals.last_values[key as keyof typeof vals.last_values] != object[key];
        if (changed)
          this.key_listeners.set(object, {
            keys: [...vals.keys],
            last_values: { ...vals.last_values, [key]: object[key] },
          });
        return true;
      } else {
        this.key_listeners.set(object, {
          keys: [...vals.keys, key],
          last_values: { ...vals.last_values, [key]: object[key] },
        });
        return false;
      }
    } else {
      this.key_listeners.set(object, {
        keys: [key],
        last_values: { [key]: object[key] },
      });
      return false;
    }
  }

  /**
   * Every x seconds
   */

  public every(interval: number, id: string): boolean {
    if (!(id in this.every_timers)) {
      this.every_timers[id] = { last: this.time, interval };
    } else {
      if (
        this.time - this.every_timers[id].last >=
        this.every_timers[id].interval
      ) {
        this.every_timers[id].last = this.time;
        return true;
      }
    }

    return false;
  }

  /**
   * Remove all listeners from id
   */

  public remove_id(id: string) {
    if (id in this.every_timers) delete this.every_timers[id];
  }
}
export default new Timer(true);
