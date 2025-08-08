import { BitmapText, Container, Ticker } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import { Entity } from "../entities/entity";
import { GameObject } from "./object";
import layers from "../render/layers";
import { GameDependencies } from "../game_deps";

export class DamageBubble extends GameObject {
  private entity: Entity;
  private damage: number;
  private container!: Container;
  private t = 0;

  constructor(entity: Entity, damage: number) {
    super();

    this.entity = entity;
    this.damage = damage;
  }

  public init(
    _assets: ObjectManifest["bundles"]["game"],
    _layers_collection: typeof layers
  ) {
    const text = new BitmapText({
      text: "-" + this.damage.toString(),
      style: {
        fontFamily: "game-font",
        fontSize: 8,
        align: "center",
      },
      anchor: 0.5,
      position: { x: this.entity.x, y: this.entity.y },
    });
    text.tint = 0xcc0000;

    this.container = text;

    return text;
  }

  public destory_container(): void {
    this.container.destroy();
  }

  public step(__: number, _: GameDependencies, { elapsedMS }: Ticker) {
    this.t += elapsedMS / 1000;
    this.container.position = {
      x: this.entity.x,
      y: this.entity.y - 35 - this.t * 10,
    };
    if (this.t >= 2) this.rip = true;
  }
}
