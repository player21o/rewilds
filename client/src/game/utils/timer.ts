export class Timer {
  private time = 0;
  private cleanup;

  constructor(cleanup = false) {
    this.cleanup = cleanup;
  }

  private every_timers: { [id: string]: { interval: number; last: number } } =
    {};
  private key_listeners: Map<
    object,
    { keys: any[]; last_values: { [a: string]: any } }
  > = new Map();

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

  public on_key_change<T extends object, S extends keyof T>(
    object: T,
    key: S
  ): [false, undefined] | [boolean, T[S]] {
    if (this.key_listeners.has(object)) {
      const vals = this.key_listeners.get(object)!;

      if (vals.keys.includes(key)) {
        const changed =
          vals.last_values[key as keyof typeof vals.last_values] != object[key];

        const prev_value = vals.last_values[key as any];
        vals.last_values[key as any] = object[key];
        return [changed, prev_value];
      } else {
        vals.keys.push(key);
        vals.last_values[key as any] = object[key];

        return [false, undefined];
      }
    } else {
      this.key_listeners.set(object, {
        keys: [key],
        last_values: { [key]: object[key] },
      });
      return [false, undefined];
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
