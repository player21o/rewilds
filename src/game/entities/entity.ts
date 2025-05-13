import { Container } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import { InputsManager } from "../input";

export class Entity<T extends object = any> {
  public sid: number;
  public shared: T;
  public x: number = 0;
  public y: number = 0;

  public constructor(shared: T & { sid: number }) {
    this.sid = shared.sid;
    this.shared = shared;
  }

  public init(
    // @ts-ignore
    assets: ObjectManifest["bundles"]["game"]
  ): undefined | Container {
    return;
  }

  public step(_: number, __: InputsManager) {}

  public render(
    _: number,
    __: InputsManager,
    ___: ObjectManifest["bundles"]["game"]
  ) {}
}
