import { Container } from "pixi.js";
import { CitizenType } from "../../common/interfaces";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import { palette } from "../utils";
import { InputsManager } from "../input";
import { GameSprite } from "../render/anim";

//type AnimatedSpriteWithRows = AdvancedAnimatedSprite & { rows: number };

export class Citizen extends Entity<CitizenType> {
  private sprites!: {
    legs: GameSprite<
      ObjectManifest["bundles"]["game"]["legs_run"]["animations"]
    >;
    body: GameSprite<ObjectManifest["bundles"]["game"]["run"]["animations"]>;
  };
  public container!: Container;

  private last_turn_row = 0;
  private isMoving = false;
  private lastPos = [0, 0];

  public init(assets: ObjectManifest["bundles"]["game"]) {
    this.x = this.shared.x;
    this.y = this.shared.y;

    const container = new Container();
    this.container = container;

    container.x = this.x;
    container.y = this.y;

    const legs = new GameSprite<
      ObjectManifest["bundles"]["game"]["legs_run"]["animations"]
    >({
      animations: assets.legs_run.animations,
      speed: 150 / 3000,
    });
    legs.scale = 1;
    legs.play();

    container.addChild(legs);

    const body = new GameSprite<
      ObjectManifest["bundles"]["game"]["run"]["animations"]
    >({
      animations: assets.run.animations,
      speed: 150 / 3000,
    });
    body.scale = 1;
    body.play();

    container.addChild(body);

    palette.apply_palette(container, 2);

    this.sprites = { body, legs };

    return container;
  }

  /*
  public step(dt: number, inputs: InputsManager): void {
    const speed = 3;

    if (inputs.is_key_pressed("s")) {
      this.y += speed * dt;
    }

    if (inputs.is_key_pressed("w")) {
      this.y -= speed * dt;
    }

    if (inputs.is_key_pressed("a")) {
      this.x -= speed * dt;
    }

    if (inputs.is_key_pressed("d")) {
      this.x += speed * dt;
    }
  }
    */

  public step(dt: number) {
    this.x += (this.shared.x - this.x) * 0.5 * dt;
    this.y += (this.shared.y - this.y) * 0.5 * dt;

    this.isMoving =
      this.shared.x != this.lastPos[0] || this.shared.y != this.lastPos[1];

    this.lastPos = [this.shared.x, this.shared.y];
  }

  public render(
    __: number,
    _: InputsManager,
    assets: ObjectManifest["bundles"]["game"]
  ) {
    this.container.pivot.set(
      this.container.width / 2,
      this.container.height / 2
    );
    this.container.position.set(this.x, this.y);

    const legsZ = [
      0, 0, 0.12697569202151154, 0.5555609039391696, 0.9148130001424937,
      0.9759662767057457, 0.9759662767057457, 0.8774320490518326,
      0.6621635047624876, 0.3537538161691129, 0.04154450834523172, 0, 0,
      0.29563636715257974, 0.8015852396513293, 1, 1, 0.839389527701953,
      0.4204586086644027, 0, 0,
    ];

    const baseLegRelativeY = 0;
    const bodyOffsetYFromLegBase = -5;
    const bobbingAmplitude = 6;
    const zOffset = 0;

    let oy = 0;

    //if (this.isMoving) { // <--- IMPORTANT: Add a check like this!
    if (true) {
      const bobbingFactor = legsZ[this.sprites.legs.frame % legsZ.length] || 0;
      oy = Math.floor(bobbingFactor * bobbingAmplitude + 0.5);
    }

    const finalLegRelativeY = Math.floor(baseLegRelativeY - zOffset - oy);
    this.sprites.legs.y = finalLegRelativeY;

    const finalBodyRelativeY = Math.floor(
      finalLegRelativeY + bodyOffsetYFromLegBase
    );
    this.sprites.body.y = finalBodyRelativeY;

    const lookat = this.shared.direction;

    const row =
      ((lookat / (Math.PI * 2)) * this.sprites.body.total_animations) | 0;

    if (this.last_turn_row != row) {
      this.last_turn_row = row;

      this.sprites.body.animation =
        `frame_row_${row.toString()}` as keyof typeof assets.run.animations;

      this.sprites.legs.animation =
        `frame_row_${row.toString()}` as keyof typeof assets.legs_run.animations;
    }
  }
}
