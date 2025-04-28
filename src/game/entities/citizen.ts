import { AnimatedSprite, Container } from "pixi.js";
import { CitizenType } from "../../common/interfaces";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import { apply_palette, lookAt } from "../utils";
import { InputsManager } from "../input";

type AnimatedSpriteWithRows = AnimatedSprite & { rows: number };

export class Citizen extends Entity<CitizenType> {
  private sprites!: {
    legs: AnimatedSpriteWithRows;
    body: AnimatedSpriteWithRows;
  };
  private container!: Container;
  private last_turn_row = 0;

  public constructor(sid: number, x: number, y: number) {
    super(sid, x, y);
  }

  public init(assets: ObjectManifest["bundles"]["game"]) {
    const container = new Container();
    this.container = container;

    container.x = this.x;
    container.y = this.y;

    const legs: AnimatedSpriteWithRows = new AnimatedSprite(
      assets.legs_run.animations.frame_row_3 as any
    ) as any;
    legs.rows = Object.keys(assets.legs_run.animations).length;
    legs.animationSpeed = 0.3;
    legs.play();
    legs.scale = 2;
    apply_palette(legs);
    container.addChild(legs);

    const body: AnimatedSpriteWithRows = new AnimatedSprite(
      assets.run.animations.frame_row_3 as any
    ) as any;
    body.rows = Object.keys(assets.run.animations).length;
    body.animationSpeed = 0.3;
    body.play();
    body.scale = 2;
    apply_palette(body);
    container.addChild(body);

    this.sprites = { body, legs };

    return container;
  }

  public render(_: number, inputs: InputsManager) {
    this.container.position.set(this.x, this.y);

    const legsZ = [
      0, 0, 0.12697569202151154, 0.5555609039391696, 0.9148130001424937,
      0.9759662767057457, 0.9759662767057457, 0.8774320490518326,
      0.6621635047624876, 0.3537538161691129, 0.04154450834523172, 0, 0,
      0.29563636715257974, 0.8015852396513293, 1, 1, 0.839389527701953,
      0.4204586086644027, 0, 0,
    ];

    const baseLegRelativeY = 0;
    const bodyOffsetYFromLegBase = -10;
    const bobbingAmplitude = 6;
    const zOffset = 0;

    let oy = 0;

    //if (this.isMoving) { // <--- IMPORTANT: Add a check like this!
    if (true) {
      const bobbingFactor =
        legsZ[this.sprites.legs.currentFrame % legsZ.length] || 0;
      oy = Math.floor(bobbingFactor * bobbingAmplitude + 0.5);
    }

    const finalLegRelativeY = Math.floor(baseLegRelativeY - zOffset - oy);
    this.sprites.legs.y = finalLegRelativeY;

    const finalBodyRelativeY = Math.floor(
      finalLegRelativeY + bodyOffsetYFromLegBase
    );
    this.sprites.body.y = finalBodyRelativeY;

    /*
    const computed_row =
      (Math.PI * 2) /
      Math.atan2(inputs.mouseY - this.y, inputs.mouseX - this.x);

    const c = (Math.PI * 2) / 16;
    */
    const lookat = lookAt(this.x, this.y, inputs.mouseX, inputs.mouseY);

    console.log(lookat);
  }
}
