import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import { GameObject } from "./object";
import { GameSprite } from "../render/anim";
import constants from "../../common/constants";
import type { Citizen } from "../entities/citizen";
import { Ticker } from "pixi.js";
import type { GameDependencies } from "../game_deps";
import { groundAngle } from "../utils";

const slashRotation = {
  slash_horizontal: 0.5,
  slash_vertical: 0,
  slash_claws: 0,
  slash_claws2: 0,
  slash_punch: 0,
  slash_punch2: 0,
  slash_dual_left: 0,
  slash_dual_right: 0,
  vertical_slash: 0,
};

export default class Slash extends GameObject {
  private entity: Citizen;
  private slash: string;
  private duration: number;
  private container!: GameSprite;
  private offsetX = 0;
  private offsetY = 0;
  private delay = 0;

  public x;
  public y;

  constructor(entity: Citizen, slash: string, duration = 0.5) {
    super();

    this.entity = entity;
    this.slash = slash;
    this.duration = duration;

    this.x = entity.x;
    this.y = entity.y;
    this.delay = duration / 2;
  }

  public init(
    assets: ObjectManifest["bundles"]["game"],
    { entities }: typeof layers
  ) {
    const weapon_data = constants.weapons[this.entity.shared.weapon];

    const container = new GameSprite({
      animations: (assets[this.slash as any as keyof typeof assets] as any)
        .animations,
      duration: this.duration,
      loop: false,
      autoUpdate: false,
    });
    container.animation =
      Object.keys(
        (assets[this.slash as any as keyof typeof assets] as any).animations
      ).length == 1
        ? "default"
        : "frame_row_" + this.entity.rows.legs;
    console.log(container.animation);
    container.play();
    container.zIndex = 999;
    this.container = container;

    container.blendMode = "overlay";
    container.tint = weapon_data.slashColor;
    container.alpha = 0.6;
    container.rotation =
      Object.keys(
        (assets[this.slash as any as keyof typeof assets] as any).animations
      ).length == 1
        ? groundAngle(
            this.entity.shared.direction +
              slashRotation[this.slash as keyof typeof slashRotation],
            16
          )
        : 0;
    this.container.visible = false;

    this.offsetX =
      Math.cos(this.entity.shared.direction) * weapon_data.meleeRange * 0.5;
    this.offsetY =
      Math.sin(this.entity.shared.direction) * weapon_data.meleeRange * 0.5;
    //slash.followOffsetZ = 20;

    entities.attach(container);

    return container;
  }

  public step(__: number, _: GameDependencies, { elapsedMS }: Ticker) {
    this.x = this.entity.x + this.offsetX;
    this.y = this.entity.y + this.offsetY - 20;

    this.container.position = { x: this.x, y: this.y };
    this.container.anchor = 0.5;

    this.delay -= elapsedMS / 1000;
  }

  public destory_container(): void {
    this.container.destroy();
  }

  public render(
    _____: number,
    _dp: GameDependencies,
    ___: ObjectManifest["bundles"]["game"],
    { elapsedMS }: Ticker
  ): void {
    if (this.delay <= 0) {
      this.container.visible = true;
      this.container.update(elapsedMS);
    }

    if (this.container.frame == this.container.last_frame) this.rip = true;
  }
}
