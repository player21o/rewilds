import type { Citizen } from ".";
import { States } from "../state";

export default {
  idle: {
    enter(_entity, _manager) {},
    leave(_entity, _manager) {},
    render(_dt, entity, _manager, assets) {
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
        const bobbingFactor =
          legsZ[entity.sprites.legs.frame % legsZ.length] || 0;
        oy = Math.floor(bobbingFactor * bobbingAmplitude + 0.5);
      }

      const finalLegRelativeY = Math.floor(baseLegRelativeY - zOffset - oy);
      entity.sprites.legs.y = finalLegRelativeY;

      const finalBodyRelativeY = Math.floor(
        finalLegRelativeY + bodyOffsetYFromLegBase
      );
      entity.sprites.body.y = finalBodyRelativeY;

      const lookat = entity.shared.direction;

      const row =
        ((lookat / (Math.PI * 2)) * entity.sprites.body.total_animations) | 0;

      if (entity.last_turn_row != row) {
        entity.last_turn_row = row;

        entity.sprites.body.animation =
          `frame_row_${row.toString()}` as keyof typeof assets.run.animations;

        entity.sprites.legs.animation =
          `frame_row_${row.toString()}` as keyof typeof assets.legs_run.animations;
      }

      if (!entity.isMoving) {
        entity.sprites.body.speed = (150 / 3000) * 2.5;
        entity.sprites.legs.stop();
        entity.sprites.legs.frame = 19;
      } else {
        entity.sprites.legs.play();
        entity.sprites.body.speed = 150 / 3000;
        //this.sprites.legs.speed = 150 / 3000;
      }
    },
    step(dt, entity, _manager) {
      const lastIsMoving = entity.isMoving;

      entity.x += (entity.shared.x - entity.x) * 0.5 * dt;
      entity.y += (entity.shared.y - entity.y) * 0.5 * dt;

      if (Date.now() - entity.lastMoveDate > 50) {
        entity.isMoving =
          entity.shared.x != entity.lastPos[0] ||
          entity.shared.y != entity.lastPos[1];

        entity.lastMoveDate = Date.now();
        entity.lastPos = [entity.shared.x, entity.shared.y];

        if (lastIsMoving != entity.isMoving) entity.sprites.body.frame = 0;
      }
    },
  },
} as States<Citizen>;
