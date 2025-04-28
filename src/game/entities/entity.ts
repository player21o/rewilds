import { Container } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";

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

  // @ts-ignore
  public step(dt: number) {}
}
