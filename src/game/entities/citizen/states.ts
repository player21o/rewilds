import type { Citizen } from ".";
import { circWrapTo, lookAt } from "../../utils";
import { States } from "../state";

function handle_movement(entity: Citizen, dt: number) {
  const lastIsMoving = entity.isMoving;

  entity.x += (entity.shared.x - entity.x) * 0.3 * dt;
  entity.y += (entity.shared.y - entity.y) * 0.3 * dt;

  if (Date.now() - entity.lastMoveDate > 50) {
    entity.isMoving =
      entity.shared.x != entity.lastPos[0] ||
      entity.shared.y != entity.lastPos[1];

    entity.lastMoveDate = Date.now();
    entity.lastPos = [entity.shared.x, entity.shared.y];

    if (lastIsMoving != entity.isMoving) entity.sprites.body.frame = 0;
  }
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
    Math.cos(entity.direction) * 16,
    1.4 * Math.sin(entity.direction) * 16
  );

  const row =
    (((direction_for_sprite - fo) / (Math.PI * 2)) *
      entity.sprites.body.total_animations) |
    0;

  if (
    entity.last_turn_row != row &&
    row > 0 &&
    row < entity.sprites.body.total_animations
  ) {
    entity.last_turn_row = row;

    entity.sprites.body.animation = `frame_row_${row.toString()}` as any;

    entity.sprites.legs.animation = `frame_row_${row.toString()}` as any;
  }
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

function handle_run_moving_animation(entity: Citizen, duration: number) {
  if (!entity.isMoving) {
    entity.sprites.body.speed = duration * 2.5;
    entity.sprites.legs.stop();
    entity.sprites.legs.frame = 19;
  } else {
    entity.sprites.legs.play();
    entity.sprites.body.speed = duration;
  }
}

export default {
  idle: {
    enter(entity, _manager, assets) {
      entity.sprites.body.animations =
        entity.shared.gender == "male"
          ? assets.run.animations
          : assets.female_run.animations;
      entity.sprites.legs.animations = assets.legs_run.animations;
      entity.sprites.body.speed = 150 / 3000;
      entity.sprites.legs.speed = 150 / 3000;
    },
    leave(_entity, _manager) {},
    render(dt, entity, _manager, _assets) {
      if (entity.container.culled) console.log("cul");
      if (entity.container.culled) return;
      handle_body_bobbing(entity);
      handle_direction(entity, dt);
      handle_run_moving_animation(entity, 150 / 3000);
    },
    step(dt, entity, _manager) {
      handle_movement(entity, dt);
    },
  },
  growl: {
    enter(entity, _manager, assets) {
      entity.sprites.body.animations =
        entity.shared.gender == "male"
          ? assets.growl.animations
          : assets.female_growl.animations;
      entity.sprites.legs.animations = assets.legs_run.animations;
      entity.sprites.body.first_frame = 2;
      entity.sprites.body.last_frame = 9;
      //entity.sprites.body.speed = (150 / 3000) * 2.5;
      //entity.sprites.legs.speed = 150 / 3000;
    },
    step(dt, entity, _manager) {
      handle_movement(entity, dt);
    },
    render(dt, entity, _manager, _assets) {
      if (entity.container.culled) return;
      handle_body_bobbing(entity);
      handle_direction(entity, dt);
      handle_run_moving_animation(entity, 400 / 3000);
    },
  },
} as States<Citizen>;
