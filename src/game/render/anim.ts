import { Sprite, Texture, Ticker } from "pixi.js";

type GameSpriteOptions = {
  animations: { [anim: string]: Texture<any>[] };
  speed: number;
};

export class GameSprite<
  T extends GameSpriteOptions["animations"]
> extends Sprite {
  private _animations: T;
  private _anim!: keyof T;
  private _frame: number = 0;
  private _speed: number = 0;
  private _timer: number = 0;
  private _total_animations: number;

  constructor(options: GameSpriteOptions) {
    super();

    this._animations = options.animations as T;
    this.animation = Object.keys(options.animations)[0];
    this.speed = options.speed;
    this.updateTexture();
    this._total_animations = Object.keys(this._animations).length;
  }

  private callback(ticker: Ticker) {
    this._timer += ticker.elapsedMS / 1000;

    if (this._timer >= this._speed) {
      this._timer = 0;

      this._frame =
        this._frame == this._animations[this._anim].length - 1
          ? 0
          : this._frame + 1;

      this.updateTexture();
    }
  }

  public play() {
    Ticker.shared.add(this.callback, this);
  }

  public stop() {
    Ticker.shared.remove(this.callback);
  }

  private updateTexture() {
    this.texture = this._animations[this._anim][this._frame];
  }

  set animation(anim: keyof T) {
    this._anim = anim;

    if (this._frame > this._animations[anim].length - 1) {
      this._frame = 0;
    }

    this.updateTexture();
  }

  set speed(speed: number) {
    this._speed = speed;
  }

  get speed() {
    return this._speed;
  }

  get frame() {
    return this._frame;
  }

  get total_frames() {
    return this._animations[this._anim].length;
  }

  get total_animations() {
    return this._total_animations;
  }
}
