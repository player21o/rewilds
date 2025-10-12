import { Container } from "pixi.js";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import { GameObject } from "../objects/object";

export class EntitiesManager {
  public entities: Entity[] = [];
  public objects: GameObject[] = [];
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

  public add(entity: Entity | GameObject) {
    if (entity instanceof Entity) {
      if (this.assets != undefined) {
        const rendered_entity = entity.init(this.assets, layers);
        if (rendered_entity != undefined) this.stage.addChild(rendered_entity);
      }

      this.entities.push(entity);
      this.sid_map[entity.sid] = entity;

      this.on_entity_created_callbacks.forEach((cb) => cb(entity));
    } else {
      this.objects.push(entity);
      if (this.assets != undefined) {
        const rendered_object = entity.init(this.assets, layers);
        if (rendered_object != undefined) this.stage.addChild(rendered_object);
      }
    }

    return entity;
  }

  public remove(entity: Entity | GameObject | number) {
    if (entity instanceof Entity) {
      entity.destroy();
      this.entities.splice(this.entities.indexOf(entity), 1);
      delete this.sid_map[entity.sid];
    } else if (entity instanceof GameObject) {
      entity.destroy();
      this.objects.splice(this.objects.indexOf(entity), 1);
    } else {
      const rip = this.sid_map[entity];
      rip.destroy();
      delete this.sid_map[entity];
      this.entities.splice(this.entities.indexOf(rip), 1);
    }
  }

  public stop() {
    this.on_entity_created_callbacks = [];
  }

  /**
   * a convenient method for looping through entities and gameobjects
   */

  public forEach(cb: (e: GameObject | Entity) => void) {
    const rip: (GameObject | Entity)[] = [];

    this.entities.forEach((e) => {
      cb(e);
      if (e.rip) rip.push(e);
    });

    this.objects.forEach((e) => {
      cb(e);
      if (e.rip) rip.push(e);
    });

    rip.forEach((r) => this.remove(r));
  }
}
