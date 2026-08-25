import {constants} from '../../../../../../common/constants';
import {SimpleGameObject} from '../../../objects/simple';
import Slash from '../../../objects/slash';
import layers from '../../../render/layers';
import tween from '../../../utils/tween';
import {States} from '../../state';
import type {Citizen} from '../index';

import {handle_basic, handle_direction, handle_growling, idle_enter} from './utils';

export default {
  idle: {
    enter(entity, _manager, assets, {entities}) {
      idle_enter(entity, assets);
      handle_growling(entity, assets, entities, true, true);
    },
    leave(_entity, _manager) {},
    step(dt, entity, {entities}, _manager, assets) {
      handle_basic(entity, dt, assets, entities);
    },
  },
  attack: {
    enter(entity, _manager, assets, {entities}) {
      const weapon = constants.weapons[entity.shared.weapon];

      const animationIndex =
          (Math.random() * weapon.attackAnimations.length) | 0;
      const animation = weapon.attackAnimations[animationIndex];
      const duration = weapon.attackDuration * entity.data.attackDuration;

      entity.set_sprites(animation, 1, false, assets);
      // entity.last_turn_row = -1;

      entities.add(
          new Slash(entity, weapon.meleeSlash[animationIndex], duration),
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
          1,
      );

      if (manager.duration >=
          constants.weapons[entity.shared.weapon].attackDuration)
        manager.set('idle', dp);
    },
  },
  dead: {
    enter(entity, manager, assets) {
      if (manager.prev_state == null)
        entity.sprites.body.animations =
            (assets
                 [(entity.shared.kind + '_' +
                   ['fall_back', 'fall_front'][(Math.random() * 2) | 0]) as
                  keyof typeof assets] as any)
                .animations;
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
      tween.tween(entity)
          .to({z: 30}, duration * 0.6, 'outQuad')
          .to({z: 0}, duration * 0.4, 'inQuad');

      entity.sprites.body.animations =
          (assets
               [(entity.shared.kind + '_' +
                 ['fall_back', 'fall_front'][(Math.random() * 2) | 0]) as
                keyof typeof assets] as any)
              .animations;
      entity.sprites.body.duration = 1.5;
      entity.sprites.body.loop = false;
      entity.sprites.body.last_frame = 9;  // to not include the standing up
                                           // anim
      entity.sprites.legs.visible = false;
      entity.sprites.shield.visible = false;
      entity.sprites.weapon.visible = false;
    },
    step(dt, entity, _dp, _manager, _assets) {
      handle_direction(entity, dt);
    },
  },
  charge: {},
  block: {
    enter(entity, _m, assets) {
      entity.set_sprites('block', 1, false, assets);
    },
    step(dt, entity, {entities}, _manager, assets) {
      handle_basic(entity, dt, assets, entities, 1, 1, false);
    },
  },
  stunned: {
    enter(entity, _m, assets, {entities}) {
      entity.sprites.legs.stop();
      entity.sprites.legs.frame = 19;
      entity.set_sprites('stunned', 1, false, assets, false);
      handle_direction(entity, 1);

      entities.add(
          // dizzy effect
          new SimpleGameObject({
            animations: (assets.dizzy as any).animations,
            autoUpdate: false,
            duration: 1,
            loop: true,
            play: true,
            layers: [layers.entities],
            sprite: {
              anchor: 0.5,
              zIndex: 10,
            },
            lifetime: 2,
            follow: {
              obj: entity,
              yOffset: -15,
            },
          }),
      );
    },
  },
  spin: {
    enter(entity, _manager, assets, {entities}) {
      // entity.sprites.body.duration = 0.1;
      entity.set_sprites('spin', 0.5, false, assets, true);
      handle_direction(entity, 1);

      const angleStep = (Math.PI * 2) / 5;

      for (let i = 0; i < 5; i++) {
        const direction = entity.direction - angleStep * i;
        entities.add(
            new Slash(entity, 'slash_horizontal', 0.25, 0.1 * i, direction),
        );
      }

      // entity.z = 8;

      tween.tween(entity).to({z: 8}, 0.3, 'linear').to({z: 0}, 0.2, 'linear');
    },

    step(dt, entity, _dp, _manager, _assets) {
      // entity.z -= 0.25 * dt;
      // console.log(entity.z);
    },
  },
  roll: {
    enter(entity, _manager, assets, _dp) {
      entity.set_sprites('roll', 0.8, true, assets, false);
      entity.sprites.legs.visible = false;
      handle_direction(entity, 1);
      entity.z = -5;
    },
  },
  kick: {
    enter(entity, _, assets, __) {
      const duration = 0.7;

      entity.set_sprites('kick', duration, false, assets, false);
      entity.sprites.legs.visible = false;
      handle_direction(entity, 1);
      entity.sounds.female_growl.stop();
      entity.sounds.male_growl.stop();

      tween.tween(entity)
          .to({z: 5}, duration * 0.3, 'linear')
          .to({z: 0}, duration * 0.5, 'linear');
    },
  },
} as States<Citizen, Citizen['shared']['state']>;
