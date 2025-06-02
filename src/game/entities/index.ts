import { Container } from "pixi.js";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import { Citizen } from "./citizen";

export class EntitiesManager {
  public entities: Entity[] = [];
  public sid_map: { [sid: number]: Entity } = {};
  private stage: Container;
  public assets: ObjectManifest["bundles"]["game"] | undefined = undefined;

  private on_entity_created_callbacks: ((entity: Entity) => void)[] = [];

  public constructor(stage: Container, assets?: typeof this.assets) {
    this.stage = stage;
    this.assets = assets;
  }

  public on_entity_created(cb: (entity: Entity) => void) {
    this.on_entity_created_callbacks.push(cb);
  }

  public add(entity: Entity) {
    this.entities.push(entity);
    this.sid_map[entity.sid] = entity;

    if (this.assets != undefined) {
      const rendered_entity = entity.init(this.assets);
      if (rendered_entity != undefined) this.stage.addChild(rendered_entity);
    }

    this.on_entity_created_callbacks.forEach((cb) => cb(entity));

    return entity;
  }

  public stop() {
    this.on_entity_created_callbacks = [];
  }
}

export const entityClasses = {
  Citizen,
};
