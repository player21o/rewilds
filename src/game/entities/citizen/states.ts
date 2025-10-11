import type { Citizen } from ".";
import { EntitiesManager } from "..";
import { ObjectManifest } from "../../../assets/manifest";
import constants from "../../../common/constants";
import Dust from "../../objects/dust";
import Slash from "../../objects/slash";
import { circWrapTo, lookAt, circWrap } from "../../utils";
import tween from "../../utils/tween";
import { States } from "../state";

function handle_movement(entity: Citizen, dt: number) {
  entity.x += (entity.shared.x - entity.x) * 0.3 * dt;
  entity.y += (entity.shared.y - entity.y) * 0.3 * dt;

  entity.isMoving = entity.shared.moving;

  if (entity.isMoving && entity.timer.every(0.5, "footstep")) {
    entity.sounds.footstep.rate(1 + (-1 + Math.random() * 2) * 0.2);
    entity.sounds.footstep.play();
  }
}

function handle_growling(
  entity: Citizen,
  assets: ObjectManifest["bundles"]["game"],
  entities: EntitiesManager,
  animate_body = true,
  force = false
) {
  if (force || entity.timer.on_key_change(entity.shared, "growling")[0]) {
    if (entity.shared.growling) {
      if (animate_body) {
        entity.sprites.body.animations =
          entity.shared.gender == "male"
            ? assets.male_growl.animations
            : assets.female_growl.animations;
        entity.sprites.body.first_frame = 2;
        entity.sprites.body.last_frame = 9;
        if (entity.shared.shield != "no_shield")
          entity.sprites.shield.animations = (
            assets[
              (entity.shared.shield + "_growl") as keyof typeof assets
            ] as any
          ).animations;
        if (entity.shared.weapon != "no_weapon")
          entity.sprites.weapon.animations = (
            assets[
              (entity.shared.weapon + "_growl") as keyof typeof assets
            ] as any
          ).animations;
      }

      entity.sprites.legs.animations = assets.legs_run.animations;

      const growl_sound =
        entity.shared.gender == "male"
          ? entity.sounds.male_growl
          : entity.sounds.female_growl;

      growl_sound.play();
      growl_sound.fade(0, 1, 1);
    } else {
      entity.sounds.male_growl.stop();
      entity.sounds.female_growl.stop();

      idle_enter(entity, assets);
    }
  }

  if (
    entity.shared.growling &&
    entity.isMoving &&
    entity.timer.every(0.1, "puff")
  )
    entities.add(
      new Dust(
        entity.x + (Math.random() * 6 - 3),
        entity.y + (Math.random() * 6 - 3)
      )
    );
}

function handle_direction(entity: Citizen, dt: number) {
  entity.direction = circWrapTo(
    entity.direction,
    entity.shared.direction,
    0.2 * dt
  );
  const fo = (-0.5 * Math.PI * 2) / entity.sprites.body.total_animations;
  const direction = lookAt(
    0,
    0,
    Math.cos(entity.direction) * 16,
    1.4 * Math.sin(entity.direction) * 16
  );

  const dirrow =
    ((circWrap(direction - fo) / (Math.PI * 2)) *
      entity.sprites.body.total_animations) |
    0;
  const dirrow_legs =
    ((circWrap(direction - fo) / (Math.PI * 2)) *
      entity.sprites.legs.total_animations) |
    0;

  entity.rows.body = dirrow;
  entity.rows.legs = dirrow_legs;

  if (entity.last_turn_row != dirrow) {
    entity.last_turn_row = dirrow;

    entity.sprites.body.animation = `frame_row_${dirrow.toString()}` as any;
    entity.sprites.legs.animation =
      `frame_row_${dirrow_legs.toString()}` as any;
    if (entity.shared.shield != "no_shield")
      entity.sprites.shield.animation = `frame_row_${dirrow.toString()}` as any;
    entity.sprites.weapon.animation = `frame_row_${dirrow.toString()}` as any;
  }
}

function idle_enter(
  entity: Citizen,
  assets: ObjectManifest["bundles"]["game"]
) {
  entity.sprites.body.animations =
    entity.shared.gender == "male"
      ? entity.shared.shield == "no_shield"
        ? assets.male_run_no_shield.animations
        : assets.male_run.animations
      : entity.shared.shield == "no_shield"
      ? assets.female_run_no_shield.animations
      : assets.female_run.animations;
  entity.sprites.legs.animations = assets.legs_run.animations;
  entity.sprites.body.duration = 150 / entity.data.speed;
  entity.sprites.legs.duration = 150 / entity.data.speed;
  if (entity.shared.shield != "no_shield")
    entity.sprites.shield.animations = (
      assets[(entity.shared.shield + "_run") as keyof typeof assets] as any
    ).animations;
  if (entity.shared.weapon != "no_weapon")
    entity.sprites.weapon.animations = (
      assets[
        entity.shared.shield == "no_shield"
          ? ((entity.shared.weapon + "_run_no_shield") as keyof typeof assets)
          : ((entity.shared.weapon + "_run") as keyof typeof assets)
      ] as any
    ).animations;
}

function handle_body_bobbing(entity: Citizen) {
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
  if (entity.isMoving) {
    const bobbingFactor = legsZ[entity.sprites.legs.frame % legsZ.length] || 0;
    oy = Math.floor(bobbingFactor * bobbingAmplitude + 0.5);
  }

  const finalLegRelativeY = Math.floor(baseLegRelativeY - zOffset - oy);
  entity.sprites.legs.y = finalLegRelativeY;

  const finalBodyRelativeY = Math.floor(
    finalLegRelativeY + bodyOffsetYFromLegBase
  );
  entity.sprites.body.y = finalBodyRelativeY;
  entity.sprites.shield.y = finalBodyRelativeY;
  entity.sprites.weapon.y = finalBodyRelativeY;
}

function handle_run_moving_animation(
  entity: Citizen,
  duration?: number,
  multiplier: number = 2.5
) {
  const speed = duration != undefined ? duration : 150 / entity.data.speed;

  if (
    entity.timer.on_key_change(entity.shared, "moving")[0] &&
    entity.state.state == "idle"
  ) {
    entity.sprites.body.frame = 0;
  }

  if (!entity.isMoving) {
    entity.sprites.body.duration = speed * multiplier;
    entity.sprites.legs.stop();
    entity.sprites.legs.frame = 19;
  } else {
    entity.sprites.legs.play();
    entity.sprites.body.duration = speed;
  }
}

function handle_basic(
  entity: Citizen,
  dt: number,
  assets: ObjectManifest["bundles"]["game"],
  entities: EntitiesManager,
  duration?: number,
  multiplier?: number,
  animate_body?: boolean
) {
  handle_movement(entity, dt);
  handle_growling(entity, assets, entities, animate_body);

  handle_body_bobbing(entity);
  handle_direction(entity, dt);
  handle_run_moving_animation(entity, duration, multiplier);
}

export default {
  idle: {
    enter(entity, _manager, assets, { entities }) {
      idle_enter(entity, assets);
      handle_growling(entity, assets, entities, true, true);
    },
    leave(_entity, _manager) {},
    step(dt, entity, { entities }, _manager, assets) {
      handle_basic(entity, dt, assets, entities);
    },
  },
  attack: {
    enter(entity, _manager, assets, { entities }) {
      const weapon = constants.weapons[entity.shared.weapon];

      const animationIndex =
        (Math.random() * weapon.attackAnimations.length) | 0;
      const animation = weapon.attackAnimations[animationIndex];
      const duration = weapon.attackDuration * entity.data.attackDuration;

      entity.set_sprites(animation, 1, false, assets);
      //entity.last_turn_row = -1;

      entities.add(
        new Slash(entity, weapon.meleeSlash[animationIndex], duration)
      );
    },
    step(dt, entity, dp, manager, assets) {
      handle_basic(
        entity,
        dt,
        assets,
        dp.entities,
        constants.weapons[entity.shared.weapon].attackDuration *
          entity.data.attackDuration,
        1
      );

      if (
        manager.duration >=
        constants.weapons[entity.shared.weapon].attackDuration
      )
        manager.set("idle", dp);
    },
  },
  dead: {
    enter(entity, manager, assets) {
      if (manager.prev_state == null)
        entity.sprites.body.animations = (
          assets[
            (entity.shared.gender +
              "_" +
              ["fall_back", "fall_front"][
                (Math.random() * 2) | 0
              ]) as keyof typeof assets
          ] as any
        ).animations;
      entity.sprites.body.duration = 1.5;
      entity.sprites.body.loop = false;
      entity.sprites.body.first_frame = 8;
      entity.sprites.body.last_frame = 9;
      entity.sprites.legs.visible = false;
      entity.sprites.shield.visible = false;
      entity.sprites.weapon.visible = false;
    },
  },
  dying: {
    enter(entity, _manager, assets, _dp) {
      const duration = 0.5;
      tween
        .tween(entity)
        .to({ z: 30 }, duration * 0.6, "outQuad")
        .to({ z: 0 }, duration * 0.4, "inQuad");

      entity.sprites.body.animations = (
        assets[
          (entity.shared.gender +
            "_" +
            ["fall_back", "fall_front"][
              (Math.random() * 2) | 0
            ]) as keyof typeof assets
        ] as any
      ).animations;
      entity.sprites.body.duration = 1.5;
      entity.sprites.body.loop = false;
      entity.sprites.body.last_frame = 9; //to not include the standing up anim
      entity.sprites.legs.visible = false;
      entity.sprites.shield.visible = false;
      entity.sprites.weapon.visible = false;
    },
    step(dt, entity, _dp, _manager, _assets) {
      handle_movement(entity, dt);
      handle_direction(entity, dt);
    },
  },
  charge: {},
  block: {
    enter(entity, _m, assets) {
      entity.set_sprites("block", 0.75, false, assets);
    },
    step(dt, entity, { entities }, _manager, assets) {
      handle_basic(entity, dt, assets, entities, 0.75, 1, false);
    },
  },
  stunned: {
    enter(entity, _m, assets) {
      entity.sprites.legs.stop();
      entity.sprites.legs.frame = 19;
      entity.set_sprites("stunned", 1, false, assets, false);
      handle_direction(entity, 1);
    },
  },
} as States<Citizen, Citizen["shared"]["state"]>;
