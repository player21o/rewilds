import { Container } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import { InputsManager } from "../input";

export class Entity<T extends object = any> {
  public sid: number;
  public shared!: T;
  public x: number;
  public y: number;

  public constructor(sid: number, x: number, y: number) {
    this.sid = sid;
    this.x = x;
    this.y = y;
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
