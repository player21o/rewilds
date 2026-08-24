import { Container, Graphics, GraphicsContext, Ticker } from "pixi.js";
import { GameObject } from "./object";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import type { GameDependencies } from "../game_deps";
import timer from "../utils/timer";

const ctx = new GraphicsContext()
  .rect(0, 0, 3, 3)
  .fill({ color: 0x000000, alpha: 0.1 });

export default class Footstep extends GameObject {
  private graphics = new Graphics({ context: ctx, blendMode: "normal-npm" });

  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }

  public init(
    _assets: ObjectManifest["bundles"]["game"],
    { ground }: typeof layers
  ): undefined | Container<any> {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.rotation = Math.random() * 6;

    ground.attach(this.graphics);

    return this.graphics;
  }

  public destory_container(): void {
    this.graphics.destroy();
  }

  public render(
    _dt: number,
    _: GameDependencies,
    ___: ObjectManifest["bundles"]["game"],
    ____: Ticker
  ): void {
    if (timer.every(0.2, "stains")) {
      this.graphics.alpha -= 0.1;
    }

    if (this.graphics.alpha <= 0 || this.culled) this.rip = true;
  }
}
