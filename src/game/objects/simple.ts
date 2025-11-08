import { Container, IRenderLayer, SpriteOptions, Ticker } from "pixi.js";
import type { GameDependencies } from "../game_deps";
import { GameSprite, GameSpriteOptions } from "../render/anim";
import { GameObject } from "./object";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";

type SimpleGameObjectOptions = GameSpriteOptions & {
  lifetime?: number;
  x?: number;
  y?: number;
  play?: boolean;
  animation?: string;
  layers: IRenderLayer[];
  sprite?: SpriteOptions;
  follow?: {
    obj: GameObject;
    xOffset?: number;
    yOffset?: number;
  };
};

export class SimpleGameObject extends GameObject {
  public container: GameSprite;
  private lifetime = -1;
  private time = 0;
  private follow_obj: GameObject | undefined = undefined;
  private follow_xoffset = 0;
  private follow_yoffset = 0;

  public constructor(options: SimpleGameObjectOptions) {
    super();
    this.container = new GameSprite(options);
    this.container.animations = options.animations;

    Object.assign(this.container, options.sprite);

    if (options.lifetime) this.lifetime = options.lifetime;
    this.x =
      options.x == undefined
        ? options.follow != undefined
          ? options.follow.obj.x
          : 0
        : options.x;
    this.y =
      options.y == undefined
        ? options.follow != undefined
          ? options.follow.obj.y
          : 0
        : options.y;

    options.layers.forEach((l) => l.attach(this.container));

    if (options.animation) this.container.animation = options.animation;
    if (options.play) this.container.play();

    this.container.position = { x: this.x, y: this.y };

    if (options.follow != undefined) {
      this.follow_obj = options.follow.obj;
      if (options.follow.xOffset != undefined)
        this.follow_xoffset = options.follow.xOffset;
      if (options.follow.yOffset != undefined)
        this.follow_yoffset = options.follow.yOffset;
    }
  }

  public init(
    _assets: ObjectManifest["bundles"]["game"],
    _layers_collection: typeof layers
  ): undefined | Container<any> {
    return this.container;
  }

  public destory_container(): void {
    this.container.destroy();
  }

  public step(__: number, _: GameDependencies, { elapsedMS }: Ticker) {
    this.time += elapsedMS / 1000;

    if (this.follow_obj != undefined) {
      this.x = this.follow_obj.x + this.follow_xoffset;
      this.y = this.follow_obj.y + this.follow_yoffset;
    }

    if (this.lifetime != -1 && this.time >= this.lifetime) this.destroy();
  }

  public render(
    _____: number,
    _: GameDependencies,
    ___: ObjectManifest["bundles"]["game"],
    { elapsedMS }: Ticker
  ): void {
    if (!this.rip) {
      this.container.position = { x: this.x, y: this.y };
      this.container.update(elapsedMS);
    }
  }
}
