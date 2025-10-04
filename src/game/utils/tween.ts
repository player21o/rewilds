import { GameObject } from "../objects/object";

type Easing = "linear" | "outQuad" | "inQuad";

function ease(easing: Easing, x: number) {
  switch (easing) {
    case "linear":
      return x;
    case "outQuad":
      return 1 - (1 - x) * (1 - x);
    case "inQuad":
      return x * x;
  }
}

type Frame<T extends GameObject = any> = [
  props: Partial<T>,
  duration: number,
  ease: Easing
];

class Tween<T extends GameObject = any> {
  private obj: T;
  private frames: Frame<T>[] = [];
  private duration = 0;
  public complete = false;
  public prev_frame!: Frame<T>;
  public mentioned_props: Set<keyof T> = new Set();

  constructor(obj: T) {
    this.obj = obj;
  }

  public step(dt: number) {
    this.duration += dt / 1000;

    if (this.prev_frame == undefined) {
      const keys: { [A in keyof T]?: any } = {};

      this.mentioned_props.forEach((k) => (keys[k] = this.obj[k]));

      this.prev_frame = [keys, 0, "linear"];
    }

    if (this.frames.length == 0) {
      this.complete = true;
      return;
    } else {
      if (this.duration >= this.frames[0][1]) {
        this.prev_frame = this.frames.shift()!;
        this.duration = 0;
      }

      if (this.frames.length == 0) {
        this.complete = true;
        return;
      } else {
        const [frame_props, frame_duration, frame_easing] = this.frames[0];
        const progress = this.duration / frame_duration;
        const coeff = ease(frame_easing, progress);

        Object.keys(frame_props).forEach((k) => {
          const start_value = this.prev_frame[0][k as keyof T] as any;
          const end_value = frame_props[k as keyof typeof frame_props] as any;

          this.obj[k as keyof T] =
            start_value + (end_value - start_value) * coeff;
        });
      }
    }
  }

  public to(props: Partial<T>, duration: number, ease: Easing = "linear") {
    Object.keys(props).forEach((k) => this.mentioned_props.add(k as keyof T));
    this.frames.push([props, duration, ease]);
    return this;
  }
}

class TweenManager {
  private tweens: Tween[] = [];

  public step(dt: number) {
    for (var i = this.tweens.length - 1; i >= 0; i--) {
      this.tweens[i].step(dt);
      if (this.tweens[i].complete) {
        this.tweens.splice(i, 1);
      }
    }
  }
  public tween<T extends GameObject>(obj: T) {
    const tw = new Tween<T>(obj);
    this.tweens.push(tw);

    return tw;
  }
}

const tween = new TweenManager();

export default tween;
