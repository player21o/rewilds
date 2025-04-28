import { AnimatedSprite, Container } from "pixi.js";
import { CitizenType } from "../../common/interfaces";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import { apply_palette } from "../utils";

export class Citizen extends Entity<CitizenType> {
  private sprites!: { legs: AnimatedSprite; body: AnimatedSprite };

  public constructor(sid: number, x: number, y: number) {
    super(sid, x, y);
  }

  public init(assets: ObjectManifest["bundles"]["game"]) {
    const container = new Container();

    container.x = this.x;
    container.y = this.y;

    const legs = new AnimatedSprite(
      assets.legs_run.animations.frame_row_3 as any
    );
    legs.animationSpeed = 0.3;
    legs.play();
    legs.scale = 2;
    apply_palette(legs);
    container.addChild(legs);

    const body = new AnimatedSprite(assets.run.animations.frame_row_3 as any);
    body.animationSpeed = 0.3;
    body.play();
    body.scale = 2;
    apply_palette(body);
    container.addChild(body);

    this.sprites = { body, legs };

    return container;
  }

  public step(_: number) {
    this.sprites.body.y = this.y - Math.random() * 10;
  }
}
