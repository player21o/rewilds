import { Container, Ticker } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import { GameObject } from "./object";
import { GameSprite } from "../render/anim";
import type { GameDependencies } from "../game_deps";

export default class Dust extends GameObject {
  private container!: Container;
  private puff!: GameSprite<any>;
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }

  public init(
    assets: ObjectManifest["bundles"]["game"],
    layers_collection: typeof layers
  ): undefined | Container<any> {
    const container = new Container();
    this.container = container;

    container.x = this.x;
    container.y = this.y;

    container.scale = 0.15;

    const smoke = new GameSprite({
      animations: assets.smoke_puff.animations,
      duration: 0.75,
      autoUpdate: false,
      loop: false,
    });

    smoke.anchor = { x: 0.5, y: 0.5 };

    smoke.animation = "default";
    smoke.play();

    this.puff = smoke;

    container.addChild(smoke);
    layers_collection.ground.attach(container);

    return container;
  }

  public destory_container(): void {
    this.container.destroy();
  }

  public render(
    _: number,
    __: GameDependencies,
    ___: ObjectManifest["bundles"]["game"],
    { elapsedMS }: Ticker
  ): void {
    this.container.pivot.set(
      this.container.width / 2,
      this.container.height / 2
    );

    this.puff.update(elapsedMS);

    if (this.puff.frame == this.puff.last_frame) this.rip = true;
  }
}
