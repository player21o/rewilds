import {
  BitmapText,
  ColorMatrixFilter,
  Container,
  Graphics,
  Ticker,
} from "pixi.js";
import { CitizenType } from "../../../common/interfaces";
import { Entity } from "../entity";
import { audio_manifest, ObjectManifest } from "../../../assets/manifest";
import { lerp, moveTo, palette } from "../../utils";
import { GameSprite } from "../../render/anim";
import { StateManager } from "../state";
import states from "./states";
import layers from "../../render/layers";
import type { GameDependencies } from "../../game_deps";
import { EntitiesManager } from "..";
import Footstep from "../../objects/footstep";
import constants from "../../../common/constants";
import { DamageBubble } from "../../objects/damageBubble";

export class Citizen extends Entity<CitizenType> {
  public sprites!: {
    legs: GameSprite;
    body: GameSprite;
    shield: GameSprite;
    weapon: GameSprite;
    bars: Graphics;
  };
  public container!: Container;
  public palette_container!: Container;
  public rows = { body: 0, legs: 0 };

  public health = 0;

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
      ObjectManifest["bundles"]["game"]["male_run"]["animations"]
    >({
      animations: assets.male_run.animations,
      duration: 150 / 3000,
      autoUpdate: false,
      loop: true,
    });
    body.scale = 1;
    body.play();

    const weapon = new GameSprite({
      animations: (
        assets[("shield_wooden" + "_run") as keyof typeof assets] as any
      ).animations,
      duration: 1,
      autoUpdate: false,
      loop: true,
    });
    weapon.scale = 1;
    weapon.play();

    const shield = new GameSprite({
      animations: (assets[("axe" + "_run") as keyof typeof assets] as any)
        .animations,
      duration: 1,
      autoUpdate: false,
      loop: true,
    });
    shield.scale = 1;
    shield.x = -2;
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
    name.tint = 0;

    /*
    const damage_text = new BitmapText({
      text: "-1.0",
      style: {
        fontFamily: "game-font",
        fontSize: 8,
        align: "center",
      },
      anchor: 0.5,
      position: { x: 60, y: 25 },
    });
    damage_text.tint = 0xcc0000;
    */

    container.addChild(palette_container, weapon, bars, name);
    shield.zIndex = 1;

    palette.apply_palette(palette_container, this.shared.team);
    palette.apply_palette(weapon, 0);

    entities.attach(palette_container, weapon);
    ground.attach(bars, name);

    this.sprites = { shield, body, legs, bars, weapon };
    this.update_bars(1);

    container.pivot.set(container.width / 2, container.height / 2);

    return container;
  }

  public step(
    _: number,
    dp: GameDependencies,
    { elapsedMS, deltaTime }: Ticker
  ) {
    this.state.set(this.shared.state, dp);
    this.timer.update(elapsedMS);

    this.x += (this.shared.x - this.x) * 0.3 * deltaTime;
    this.y += (this.shared.y - this.y) * 0.3 * deltaTime;

    this.isMoving = this.shared.moving;

    if (this.isMoving && this.timer.every(0.5, "footstep")) {
      this.sounds.footstep.rate(1 + (-1 + Math.random() * 2) * 0.2);
      this.sounds.footstep.play();
    }

    this.health = this.shared.health;

    const hp = this.timer.on_key_change(this, "health");

    if (hp[0]) {
      const difference = hp[1] - this.shared.health;
      dp.entities.add(new DamageBubble(this, difference));

      const filter = new ColorMatrixFilter();
      filter.brightness(10, true);
      filter.tint("red", true);

      this.palette_container.filters = [
        ...this.palette_container.filters,
        filter,
      ];

      setTimeout(
        () =>
          (this.palette_container.filters =
            this.palette_container.filters.filter((f) => f != filter)),
        200
      );
    }
  }

  public render(
    __: number,
    dp: GameDependencies,
    assets: ObjectManifest["bundles"]["game"],
    { elapsedMS, deltaTime }: Ticker
  ) {
    if (this.shared.shield == "no_shield") this.sprites.shield.visible = false;
    if (this.shared.weapon == "no_weapon") this.sprites.weapon.visible = false;

    this.container.position.set(this.x, this.y);
    this.palette_container.position.y = -this.z;

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

    const crst = this.timer.on_key_change(
      this.bar_params,
      "current_stamina"
    )[0];
    const st = this.timer.on_key_change(this.bar_params, "stamina")[0];
    const h = this.timer.on_key_change(this.shared, "health")[0];

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

    if (this.shared.shield != "no_shield")
      this.sprites.shield.frame = this.sprites.body.frame;
    if (this.shared.weapon != "no_weapon")
      this.sprites.weapon.frame = this.sprites.body.frame;
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

  public set_sprites(
    animation: string,
    duration: number,
    loop: boolean,
    assets: ObjectManifest["bundles"]["game"],
    check_shield?: boolean
  ) {
    this.sprites.body.animations = (
      assets[
        (this.shared.gender +
          "_" +
          animation +
          (this.shared.shield == "no_shield"
            ? "_no_shield"
            : "")) as keyof typeof assets
      ] as any
    ).animations;
    this.sprites.body.duration = duration;
    this.sprites.body.loop = loop;
    this.sprites.body.play();

    this.sprites.weapon.animations = (
      assets[
        (this.shared.weapon +
          "_" +
          animation +
          (this.shared.shield == "no_shield" &&
          (check_shield == undefined || check_shield == true)
            ? "_no_shield"
            : "")) as keyof typeof assets
      ] as any
    ).animations;

    if (this.shared.shield != "no_shield")
      this.sprites.shield.animations = (
        assets[
          (this.shared.shield + "_" + animation) as keyof typeof assets
        ] as any
      ).animations;
  }
}
