import { Container } from "pixi.js";
import layers from "../render/layers";
import { InputsManager } from "../input";
import { ObjectManifest } from "../../assets/manifest";
import { Ticker } from "pixi.js";

/**
 * a gameobject is like an... object??? i mean... it's just a game object
 * the difference between an entity and a gameobject is that the entity is synced across the network, while the gameobject is just a local thing
 * but entity inherits from gameobject. wow.
 */

export class GameObject {
  public culled = false;
  public new = true;
  public rip = false;
  public x: number = 0;
  public y: number = 0;

  public init(
    // @ts-ignore
    assets: ObjectManifest["bundles"]["game"],
    // @ts-ignore
    layers_collection: typeof layers
  ): undefined | Container<any> {
    return;
  }

  public step(_: number, __: InputsManager): any {}

  public render(
    _: number,
    __: InputsManager,
    ___: ObjectManifest["bundles"]["game"],
    ____: Ticker
  ) {}

  public on_first_appearance() {}

  public show() {}
  public hide() {}
  public destroy() {
    this.rip = true;
    this.destory_container();
  }
  public destory_container() {}
}
