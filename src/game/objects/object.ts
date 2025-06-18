import { Container } from "pixi.js";
import layers from "../render/layers";
import { InputsManager } from "../input";
import { ObjectManifest } from "../../assets/manifest";
import { Ticker } from "pixi.js";

export class GameObject {
  public culled = false;
  public new = true;

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
}
