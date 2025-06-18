import { Container, Ticker } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import { GameObject } from "./object";
import { GameSprite } from "../render/anim";
import { InputsManager } from "../input";

class Dust extends GameObject {
  private container!: Container;
  private puff!: GameSprite<any>;

  public init(
    assets: ObjectManifest["bundles"]["game"],
    layers_collection: typeof layers
  ): undefined | Container<any> {
    const container = new Container();
    this.container = container;

    const smoke = new GameSprite({
      animations: assets.smoke_puff.animations,
      speed: 150 / 3000,
      autoUpdate: false,
      loop: false,
    });

    this.puff = smoke;

    container.addChild(smoke);
    layers_collection.entities.attach(container);

    return container;
  }

  public destory_container(): void {
    this.container.destroy();
  }

  public render(
    _: number,
    __: InputsManager,
    ___: ObjectManifest["bundles"]["game"],
    { elapsedMS }: Ticker
  ): void {
    this.puff.update(elapsedMS);
  }
}
