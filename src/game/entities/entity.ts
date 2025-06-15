import { Container, Ticker } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import { InputsManager } from "../input";
import layers from "../render/layers";

export class Entity<T extends object = any> {
  public sid: number;
  public shared: T;
  public x: number = 0;
  public y: number = 0;
  public culled = false;
  public new = true;

  public constructor(shared: T & { sid: number }) {
    this.sid = shared.sid;
    this.shared = shared;
  }

  public init(
    // @ts-ignore
    assets: ObjectManifest["bundles"]["game"],
    layers_collection: typeof layers
  ): undefined | Container {
    return;
  }

  public step(_: number, __: InputsManager) {}

  public render(
    _: number,
    __: InputsManager,
    ___: ObjectManifest["bundles"]["game"],
    ____: Ticker
  ) {}

  public on_first_appearance() {}
}
