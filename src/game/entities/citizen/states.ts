import type { Citizen } from ".";
import { EntitiesManager } from "..";
import { ObjectManifest } from "../../../assets/manifest";
import Dust from "../../objects/dust";
import { choose, circWrapTo, lookAt } from "../../utils";
import { States } from "../state";

function handle_movement(entity: Citizen, dt: number) {
  entity.x += (entity.shared.x - entity.x) * 0.3 * dt;
  entity.y += (entity.shared.y - entity.y) * 0.3 * dt;

  entity.isMoving = entity.shared.moving;
}

function handle_growling(
  entity: Citizen,
  assets: ObjectManifest["bundles"]["game"],
  entities: EntitiesManager
) {
  if (entity.timer.on_key_change(entity.shared, "growling")) {
    if (entity.shared.growling) {
      entity.sprites.body.animations =
        entity.shared.gender == "male"
          ? assets.growl.animations
          : assets.female_growl.animations;
      entity.sprites.legs.animations = assets.legs_run.animations;
      entity.sprites.body.first_frame = 2;
      entity.sprites.body.last_frame = 9;

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
    entities.add(new Dust(entity.x, entity.y + Math.random() * 6));
}

function handle_direction(entity: Citizen, dt: number) {
  entity.direction = circWrapTo(
    entity.direction,
    entity.shared.direction,
    0.2 * dt
  );
  const fo = (-0.5 * Math.PI * 2) / entity.sprites.body.total_animations;
  const direction_for_sprite = lookAt(
    0,
    0,
    Math.cos(entity.direction) * entity.sprites.body.total_animations,
    1.4 * Math.sin(entity.direction) * entity.sprites.body.total_animations
  );

  const body_row =
    (((direction_for_sprite - fo) / (Math.PI * 2)) *
      entity.sprites.body.total_animations) |
    0;
  const legs_row =
    (((direction_for_sprite - fo) / (Math.PI * 2)) *
      entity.sprites.legs.total_animations) |
    0;

  if (
    entity.last_turn_row != body_row &&
    body_row > 0 &&
    body_row < entity.sprites.body.total_animations
  ) {
    entity.last_turn_row = body_row;

    entity.sprites.body.animation = `frame_row_${body_row.toString()}` as any;

    entity.sprites.legs.animation = `frame_row_${legs_row.toString()}` as any;
  }
}

function idle_enter(
  entity: Citizen,
  assets: ObjectManifest["bundles"]["game"]
) {
  entity.sprites.body.animations =
    entity.shared.gender == "male"
      ? assets.run.animations
      : assets.female_run.animations;
  entity.sprites.legs.animations = assets.legs_run.animations;
  entity.sprites.body.speed = 150 / 3000;
  entity.sprites.legs.speed = 150 / 3000;
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
}

function handle_run_moving_animation(
  entity: Citizen,
  duration?: number,
  multiplier: number = 2.5
) {
  const speed =
    duration != undefined
      ? duration
      : (entity.shared.growling ? 400 : 150) / 3000;

  if (!entity.isMoving) {
    entity.sprites.body.speed = speed * multiplier;
    entity.sprites.legs.stop();
    entity.sprites.legs.frame = 19;
  } else {
    entity.sprites.legs.play();
    entity.sprites.body.speed = speed;
  }
}

export default {
  idle: {
    enter(entity, _manager, assets) {
      idle_enter(entity, assets);
    },
    leave(_entity, _manager) {},
    step(dt, entity, { entities }, _manager, assets) {
      handle_movement(entity, dt);
      handle_growling(entity, assets, entities);
      if (entity.isMoving && entity.timer.every(0.5, "footstep")) {
        entity.sounds.footstep.rate(1 + (-1 + Math.random() * 2) * 0.2);
        entity.sounds.footstep.play();
      }

      handle_body_bobbing(entity);
      handle_direction(entity, dt);
      handle_run_moving_animation(entity);
    },
  },
  attack: {
    enter(entity, _manager, assets) {
      entity.sprites.body.animations =
        entity.shared.gender == "male"
          ? choose([
              assets.male_attack_horizontal.animations,
              assets.male_attack_vertical.animations,
            ])
          : choose([
              assets.female_attack_horizontal.animations,
              assets.female_attack_vertical.animations,
            ]);
      entity.last_turn_row = -1;
      entity.sprites.body.speed = 100 / 3000;
    },
    step(dt, entity, { entities }, _manager, assets) {
      handle_movement(entity, dt);
      handle_growling(entity, assets, entities);
      handle_body_bobbing(entity);
      handle_direction(entity, dt);
      handle_run_moving_animation(entity, 100 / 3000, 1);
    },
  },
} as States<Citizen>;
