import {Citizen} from '../entities/citizen';
import {Circle, CollisionResponse} from '../entities/collisions';
import {GameNetworking} from '../networking';
import {distance} from '../utils';

import {GameObject} from './object';

export class BotSight extends GameObject {
  private entity: Citizen;
  public entities = new Set<Citizen>();
  public move_out_collision = false;

  constructor(e: Citizen, radius = 100) {
    super();

    this.entity = e;
    this.collision = new Circle(0, this.x, this.y, radius);
  }

  public step(_dt: number): void {
    this.x = this.entity.x;
    this.y = this.entity.y;
  }

  public on_collision(
      other: GameObject, _response: CollisionResponse,
      _network?: GameNetworking): void {
    if (other instanceof Citizen && other.state != 'dead' &&
        other.sid != this.entity.sid && !this.entities.has(other)) {
      this.entities.add(other);
    }
  }

  public remove_entity(entity: Citizen) {
    this.entities.delete(entity);
  };

  public get_closest_entity() {
    const entity_array = [...this.entities].sort(
        (a, b) => distance(this.x, this.y, a.x, a.y) -
            distance(this.x, this.y, b.x, b.y));

    return entity_array[0];
  };
}
