import { Container } from "pixi.js";
import layers from "../render/layers";
import { ObjectManifest } from "../../assets/manifest";
import { Ticker } from "pixi.js";
import { GameDependencies } from "../game_deps";
import { Timer } from "../utils/timer";

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

  public timer: Timer = new Timer();

  public init(
    // @ts-ignore
    assets: ObjectManifest["bundles"]["game"],
    // @ts-ignore
    layers_collection: typeof layers
  ): undefined | Container<any> {
    return;
  }

  public step(__: number, _: GameDependencies, ___: Ticker): any {}
  public culled_step() {}

  public render(
    _____: number,
    _: GameDependencies,
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
