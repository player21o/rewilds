class Timer {
  private time = 0;

  private every_timers: { [id: number]: { interval: number; last: number } } =
    {};

  public update(elapsedMS: number) {
    this.time += elapsedMS / 1000;
  }

  /**
   * Every x seconds
   */

  public every(interval: number, id: number): boolean {
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

  public remove_id(id: number) {
    if (id in this.every_timers) delete this.every_timers[id];
  }
}
export default new Timer();
