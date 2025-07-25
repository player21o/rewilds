import { Sprite, Texture, Ticker } from "pixi.js";

type Anims = { [anim: string]: Texture<any>[] };

type GameSpriteOptions = {
  animations: Anims;
  duration: number;
  autoUpdate: boolean;
  loop: boolean;
};

export class GameSprite<
  T extends GameSpriteOptions["animations"] = any
> extends Sprite {
  private _animations: T;
  private _anim!: keyof T;
  private _frame: number = 0;
  private _duration: number = 0;
  private _timer: number = 0;
  private _total_animations: number;
  public animation_index!: number;
  private _auto_update: boolean;
  private _playing: boolean = false;
  private _start_frame = 0;
  private _last_frame = -1;
  private _loop = false;

  constructor(options: GameSpriteOptions) {
    super({ cullable: true });

    this._animations = options.animations as T;
    this._last_frame =
      this._animations[Object.keys(options.animations)[0]].length - 1;
    this._start_frame = 0;
    this.animation = Object.keys(options.animations)[0];
    this.duration = options.duration;
    this._total_animations = Object.keys(this._animations).length;
    this._auto_update = options.autoUpdate;
    this._loop = options.loop;
  }

  private callback(ticker: Ticker) {
    this.update(ticker.elapsedMS);
  }

  public play() {
    this._playing = true;

    if (this._auto_update) Ticker.shared.add(this.callback, this);
  }

  public stop() {
    this._playing = false;
    this._timer = 0;
    if (this._auto_update) Ticker.shared.remove(this.callback);
  }

  public update(elapsedMS: number) {
    if (this._playing) {
      this._timer += elapsedMS / 1000;
      /*

      const progress = Math.min(1.0, this._timer / this._duration);

      var frameNumber =
        (this._start_frame + (this._last_frame - this._start_frame + 1)) | 0;

      var finalFrame = Math.min(this._last_frame, frameNumber);

      console.log(progress, this._duration);

      if (this._frame != finalFrame) {
        this._frame = finalFrame;
        this.updateTexture();

        if (progress >= 1.0) {
          if (this._loop) {
            this._timer = 0;
          } else {
            this._playing = false;
          }
        }
      }
        */

      /*
      this.setFrame(finalFrame);

      */
      if (
        this._timer >=
        this._duration / (this._last_frame - this._start_frame)
      ) {
        this._timer = 0;

        this._frame = this._loop
          ? this._frame == this._last_frame
            ? this._start_frame
            : this._frame + 1
          : this._frame == this._last_frame
          ? this._last_frame
          : this._frame + 1;

        this.updateTexture();
      }
    }
  }

  private updateTexture() {
    if (this._anim in this._animations) {
      this.texture = this._animations[this._anim][this._frame];
    } else {
      console.warn("Didn`t find any texture");
    }
  }

  set animation(anim: keyof T) {
    this._anim = anim;
    this.animation_index = Object.keys(this._animations).indexOf(
      anim as string
    );

    if (this._frame > this._last_frame) {
      this._frame = this._start_frame;
    }

    this.updateTexture();
  }

  set first_frame(f: number) {
    this._start_frame = f;

    this.frame = this.frame < f ? f : this.frame;
  }

  set last_frame(f: number) {
    this._last_frame = f;

    this.frame = this.frame > f ? f : this.frame;
  }

  get last_frame() {
    return this._last_frame;
  }

  set animations(v: T) {
    this._animations = v;
    //this.animation = Object.keys(v)[0];
    this._frame = 0;
    this._total_animations = Object.keys(this._animations).length;
    this._last_frame = this._animations[Object.keys(v)[0]].length - 1;
    this._start_frame = 0;
  }

  set duration(speed: number) {
    this._duration = speed;
  }

  get duration() {
    return this._duration;
  }

  get frame() {
    return this._frame;
  }

  set frame(f: number) {
    this._frame = f;
    this.updateTexture();
  }

  get total_frames() {
    return this._animations[this._anim].length;
  }

  get total_animations() {
    return this._total_animations;
  }
}
