import { BitmapText, Container, Graphics, Ticker } from "pixi.js";
import { CitizenType } from "../../../common/interfaces";
import { Entity } from "../entity";
import { audio_manifest, ObjectManifest } from "../../../assets/manifest";
import { lerp, moveTo, palette } from "../../utils";
import { GameSprite } from "../../render/anim";
import { StateManager } from "../state";
import states from "./states";
import layers from "../../render/layers";
import { GameDependencies } from "../../game_deps";
import { EntitiesManager } from "..";
import Footstep from "../../objects/footstep";
import constants from "../../../common/constants";

export class Citizen extends Entity<CitizenType> {
  public sprites!: {
    legs: GameSprite;
    body: GameSprite;
    shield: GameSprite;
    bars: Graphics;
  };
  public container!: Container;
  public palette_container!: Container;
  public rows = { body: 0, legs: 0 };

  public last_turn_row = 0;
  public isMoving = false;

  public data!: (typeof constants)["minions"]["default"] &
    (typeof constants)["minions"][keyof (typeof constants)["minions"]];

  public direction = 0;

  public state = new StateManager<typeof this.shared.state>(states, this);

  public bar_params: {
    enemy: boolean;
    stamina: number;
    hide_stamina: boolean;
    current_stamina: number;
  } = {
    enemy: false,
    stamina: 1,
    hide_stamina: true,
    current_stamina: 1,
  };

  public sounds = {
    footstep: audio_manifest.footstep(),
    male_growl: audio_manifest.male_growl(),
    female_growl: audio_manifest.female_growl(),
  };

  public on_first_appearance(): void {
    Object.keys(this.sounds).forEach((sound) => {
      this.sounds[sound as keyof typeof this.sounds].load();
    });
  }

  public destory_container() {
    this.container.destroy();
  }

  public hide(): void {
    this.container.visible = false;
  }

  public show(): void {
    this.container.visible = true;
  }

  public culled_step(): void {
    this.x = this.shared.x;
    this.y = this.shared.y;
  }

  public init(
    assets: ObjectManifest["bundles"]["game"],
    { entities, ground }: typeof layers
  ) {
    this.data = {
      ...constants.minions["default"],
      ...constants.minions[this.shared.type],
    } as any;

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
      duration: 150 / 3000,
      autoUpdate: false,
      loop: true,
    });
    legs.scale = 1;
    legs.play();

    const body = new GameSprite<
      ObjectManifest["bundles"]["game"]["run"]["animations"]
    >({
      animations: assets.run.animations,
      duration: 150 / 3000,
      autoUpdate: false,
      loop: true,
    });
    body.scale = 1;
    body.play();

    const shield = new GameSprite({
      animations: (
        assets[(this.shared.shield + "_run") as keyof typeof assets] as any
      ).animations,
      duration: 1,
      autoUpdate: false,
      loop: true,
    });
    shield.scale = 1;
    shield.play();

    const palette_container = new Container({ sortableChildren: false });
    palette_container.addChild(legs, body, shield);
    this.palette_container = palette_container;

    const name = new BitmapText({
      text: this.shared.name.toUpperCase(),
      anchor: 0.5,
      position: { x: 60, y: 100 },
      style: { fontFamily: "game-font", fontSize: 8, align: "center" },
    });

    container.addChild(palette_container, bars, name);
    shield.zIndex = 1;

    palette.apply_palette(palette_container, this.shared.team);

    entities.attach(palette_container);
    ground.attach(bars, name);

    this.sprites = { shield, body, legs, bars };
    this.update_bars(1);

    return container;
  }

  public step(_: number, dp: GameDependencies, { elapsedMS }: Ticker) {
    this.state.set(this.shared.state, dp);
    this.timer.update(elapsedMS);
  }

  public render(
    __: number,
    dp: GameDependencies,
    assets: ObjectManifest["bundles"]["game"],
    { elapsedMS, deltaTime }: Ticker
  ) {
    this.container.pivot.set(
      this.container.width / 2,
      this.container.height / 2
    );
    this.container.position.set(this.x, this.y);

    this.state.step(deltaTime, dp, assets);

    if (
      this.sprites.body.animation_index >
        (this.sprites.body.total_animations - 1) * 0.75 ||
      this.sprites.body.animation_index === 0
    ) {
      // Condition A: Character is facing DOWN or a side-down angle.
      // The shield is drawn BEFORE the torso.
      this.sprites.shield.zIndex = -1;
    } else {
      // Condition B: Character is facing UP or a side-up angle.
      // The torso is drawn BEFORE the shield.
      this.sprites.shield.zIndex = 1;
    }

    //if (this.direction > Math.PI + Math.PI / 2) {
    //  this.sprites.shield.zIndex = -1;
    //} else {
    //  this.sprites.shield.zIndex = 1;
    //}

    this.update_anims(elapsedMS);

    const crst = this.timer.on_key_change(this.bar_params, "current_stamina");
    const st = this.timer.on_key_change(this.bar_params, "stamina");
    const h = this.timer.on_key_change(this.shared, "health");

    const bar_needs_to_be_updated =
      (!this.bar_params.hide_stamina && (crst || st)) || h;

    if (bar_needs_to_be_updated) this.update_bars(deltaTime);

    this.palette_container.zIndex = this.y;

    this.render_stains(dp.entities);
  }

  public update_bar_params(params: Partial<typeof this.bar_params>) {
    this.bar_params = { ...this.bar_params, ...params };
  }

  public update_bars(dt: number) {
    const params = this.bar_params;
    const bars = this.sprites.bars;

    this.bar_params.current_stamina = moveTo(
      this.bar_params.current_stamina,
      this.bar_params.stamina,
      Math.abs(this.bar_params.current_stamina - this.bar_params.stamina) *
        (dt / 50) *
        2.0
    );

    const stamina_bar_looks = { line_thickness: 3, radius: 10.5 };
    const health_bar_looks = {
      line_thickness: 3,
      radius: 15,
      color: !params.enemy ? 0x37946e : 0xaa0000,
    };

    bars.clear();

    bars
      .circle(250 / 4 - 3, 250 / 4 + 62 - 2, 12)
      .fill({ alpha: 0.25, color: 0x000000 })
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + stamina_bar_looks.radius)
      .closePath();

    if (!params.hide_stamina) {
      bars
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
          lerp(Math.PI / 2, 0, params.current_stamina / 1),
          true
        )
        .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + stamina_bar_looks.radius)
        .arc(
          250 / 4 - 3,
          250 / 4 + 62 - 2,
          stamina_bar_looks.radius,
          Math.PI / 2,
          lerp(Math.PI / 2, Math.PI, params.current_stamina / 1),
          false
        )
        .stroke({ color: 0xffffff, width: stamina_bar_looks.line_thickness })
        .moveTo(250 / 4 - 3, 250 / 4 + 62 - 2 + health_bar_looks.radius)

        .closePath();
    }

    bars
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 1,
        health_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, 0, this.shared.health / this.shared.maxHealth),
        true
      )
      .moveTo(250 / 4 - 3, 250 / 4 + 62 - 1 + health_bar_looks.radius)
      .arc(
        250 / 4 - 3,
        250 / 4 + 62 - 1,
        health_bar_looks.radius,
        Math.PI / 2,
        lerp(Math.PI / 2, Math.PI, this.shared.health / this.shared.maxHealth),
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
    //this.sprites.shield.update(elapsed);
  }

  private render_stains(entities: EntitiesManager) {
    if (this.isMoving && this.timer.every(0.5, "footstep")) {
      entities.add(
        new Footstep(
          this.x + Math.random() * 8 - 4,
          this.y + Math.random() * 8 - 4
        )
      );
    }
  }
}
