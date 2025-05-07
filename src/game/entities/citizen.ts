import { Container } from "pixi.js";
import { CitizenType } from "../../common/interfaces";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import { lookAt } from "../utils";
import { InputsManager } from "../input";
import { PaletteSwapFilter } from "../render/filters/palette_swap";
import { GameSprite } from "../render/anim";

//type AnimatedSpriteWithRows = AdvancedAnimatedSprite & { rows: number };

export class Citizen extends Entity<CitizenType> {
  private sprites!: {
    legs: GameSprite<
      ObjectManifest["bundles"]["game"]["legs_run"]["animations"]
    >;
    body: GameSprite<ObjectManifest["bundles"]["game"]["run"]["animations"]>;
  };
  private container!: Container;
  private last_turn_row = 0;
  private c = 0;

  public constructor(sid: number, x: number, y: number) {
    super(sid, x, y);
  }

  public init(assets: ObjectManifest["bundles"]["game"]) {
    const container = new Container();
    this.container = container;

    container.x = this.x;
    container.y = this.y;

    const legs = new GameSprite({
      animations: assets.legs_run.animations,
    });
    legs.rows = Object.keys(assets.legs_run.animations).length;
    legs.scale = 2;
    legs.animationSpeed = 0.3;
    container.addChild(legs);

    const body = new GameSprite({
      animations: assets.run.animations,
    });
    body.rows = Object.keys(assets.run.animations).length;
    body.scale = 2;
    body.animationSpeed = 0.3;

    container.addChild(body);

    container.filters = [
      new PaletteSwapFilter({ palette: assets.palette as any, row: 0 }),
    ];

    console.log(assets.palette);

    this.sprites = { body, legs };

    return container;
  }

  public render(
    dt: number,
    inputs: InputsManager,
    assets: ObjectManifest["bundles"]["game"]
  ) {
    this.c += dt / 100;
    //console.log(this.c);
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

    const row = ((lookat / (Math.PI * 2)) * this.sprites.body.rows) | 0;
    //console.log(row);

    if (this.last_turn_row != row) {
      this.last_turn_row = row;
      /*
      this.sprites.body.textures = assets.run.animations[
        `frame_row_${row.toString()}` as keyof typeof assets.run.animations
      ] as any;
      this.sprites.legs.textures = assets.legs_run.animations[
        `frame_row_${row.toString()}` as keyof typeof assets.run.animations
      ] as any;
       */

      this.sprites.body.set_animation(
        `frame_row_${row.toString()}` as keyof typeof assets.run.animations
      );
      this.sprites.legs.set_animation(
        `frame_row_${row.toString()}` as keyof typeof assets.legs_run.animations
      );

      //this.sprites.body.currentFrame = this.anim_frame;
      //this.sprites.legs.currentFrame = this.anim_frame;
    }
  }
}
