import { Container, Graphics, Ticker } from "pixi.js";
import { CitizenType } from "../../../common/interfaces";
import { Entity } from "../entity";
import { audio_manifest, ObjectManifest } from "../../../assets/manifest";
import { lerp, palette } from "../../utils";
import { InputsManager } from "../../input";
import { GameSprite } from "../../render/anim";
import { StateManager } from "../state";
import states from "./states";
import layers from "../../render/layers";

//type AnimatedSpriteWithRows = AdvancedAnimatedSprite & { rows: number };

export class Citizen extends Entity<CitizenType> {
  public sprites!: {
    legs: GameSprite<
      ObjectManifest["bundles"]["game"]["legs_run"]["animations"]
    >;
    body: GameSprite<ObjectManifest["bundles"]["game"]["run"]["animations"]>;
    bars: Graphics;
  };
  public container!: Container;
  public palette_container!: Container;

  public last_turn_row = 0;
  public isMoving = false;

  public direction = this.shared.direction;

  public state = new StateManager<typeof this.shared.state>(states, this);

  public played_footstep = 0;

  public bar_params: { enemy: boolean; stamina: number } = {
    enemy: false,
    stamina: 0.5,
  };

  public sounds = {
    footstep: audio_manifest.footstep(),
    male_growl: audio_manifest.male_growl(),
  };

  private bar_needs_to_be_updated = true;

  public on_first_appearance(): void {
    Object.keys(this.sounds).forEach((sound) => {
      this.sounds[sound as keyof typeof this.sounds].load();
    });
  }

  public init(
    assets: ObjectManifest["bundles"]["game"],
    { entities, ground }: typeof layers
  ) {
    this.state.assets = assets;
    this.x = this.shared.x;
    this.y = this.shared.y;

    const container = new Container({ cullable: true, cullableChildren: true });
    this.container = container;

    container.x = this.x;
    container.y = this.y;

    const bars = new Graphics({
      blendMode: "normal-npm",
      scale: { x: 1, y: 0.6 },
      zIndex: 0,
    });

    const legs = new GameSprite<
      ObjectManifest["bundles"]["game"]["legs_run"]["animations"]
    >({
      animations: assets.legs_run.animations,
      speed: 150 / 3000,
      autoUpdate: false,
    });
    legs.scale = 1;
    legs.play();

    const body = new GameSprite<
      ObjectManifest["bundles"]["game"]["run"]["animations"]
    >({
      animations: assets.run.animations,
      speed: 150 / 3000,
      autoUpdate: false,
    });
    body.scale = 1;
    body.play();

    const palette_container = new Container({ zIndex: 1 });
    palette_container.addChild(legs, body);
    this.palette_container = palette_container;

    container.addChild(palette_container, bars);

    palette.apply_palette(palette_container, this.shared.team);

    entities.attach(palette_container);
    ground.attach(bars);

    this.sprites = { body, legs, bars };

    return container;
  }

  public step(dt: number) {
    this.state.set(this.shared.state);
    this.state.step(dt);
  }

  public render(
    __: number,
    _: InputsManager,
    assets: ObjectManifest["bundles"]["game"],
    { elapsedMS, deltaTime }: Ticker
  ) {
    this.container.pivot.set(
      this.container.width / 2,
      this.container.height / 2
    );
    this.container.position.set(this.x, this.y);

    this.state.render(deltaTime, assets);

    this.update_anims(elapsedMS);
    if (this.bar_needs_to_be_updated) {
      this.update_bars();
      this.bar_needs_to_be_updated = false;
    }

    this.palette_container.zIndex = this.y;
  }

  public update_bar_params(params: typeof this.bar_params) {
    this.bar_params = params;
    this.bar_needs_to_be_updated = true;
  }

  private update_bars() {
    const params = this.bar_params;
    const bars = this.sprites.bars;

    const stamina_bar_looks = { line_thickness: 3, radius: 12 };
    const health_bar_looks = {
      line_thickness: 3,
      radius: 17,
      color: !params.enemy ? 0x37946e : 0xaa0000,
    };

    bars.clear();

    bars
      .circle(250 / 4 - 3, 250 / 4 + 62 - 2, 13)
      .fill({ alpha: 0.25, color: 0x000000 })
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + stamina_bar_looks.radius)
      .closePath()
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 2,
        stamina_bar_looks.radius,
        0,
        Math.PI,
        false
      )
      .stroke({ color: 0x555555, width: stamina_bar_looks.line_thickness })
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + stamina_bar_looks.radius)
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 2,
        stamina_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, 0, params.stamina),
        true
      )
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + stamina_bar_looks.radius)
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 2,
        stamina_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, Math.PI, params.stamina),
        false
      )
      .stroke({ color: 0xffffff, width: stamina_bar_looks.line_thickness })
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + health_bar_looks.radius)

      .closePath()

      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 2,
        health_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, 0, this.shared.health / 10),
        true
      )
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + health_bar_looks.radius)
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 2,
        health_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, Math.PI, this.shared.health / 10),
        false
      )
      .stroke({
        color: health_bar_looks.color,
        width: health_bar_looks.line_thickness,
      });
  }

  private update_anims(elapsed: number) {
    this.sprites.body.update(elapsed);
    this.sprites.legs.update(elapsed);
  }
}
