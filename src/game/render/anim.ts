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

  constructor(options: GameSpriteOptions) {
    super();

    this._animations = options.animations as T;
    this.animation = Object.keys(options.animations)[0];
    this.speed = options.speed;
  }

  private callback(ticker: Ticker) {
    //const elapsed =
  }

  public play() {
    Ticker.shared.add(this.callback);
  }

  public stop() {
    Ticker.shared.remove(this.callback);
  }

  set animation(anim: keyof T) {
    this._anim = anim;

    if (this._frame > this._animations[anim].length - 1) {
      this._frame = 0;
    }
  }

  set speed(speed: number) {
    this._speed = speed;
  }

  get speed() {
    return this._speed;
  }
}
