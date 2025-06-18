class Timer {
  private time = 0;

  private every_timers: { [id: string]: { interval: number; last: number } } =
    {};

  public update(elapsedMS: number) {
    this.time += elapsedMS / 1000;

    if (this.every(5, "cleanup")) {
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
export default new Timer();
