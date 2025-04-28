import { Container } from "pixi.js";
import { Entity } from "./entity";
import { ObjectManifest } from "../../assets/manifest";

export class EntitiesManager {
  public entities: Entity[] = [];
  public sid_map: { [sid: number]: Entity } = {};
  private stage: Container;
  private assets: ObjectManifest["bundles"]["game"];

  public constructor(stage: Container, assets: typeof this.assets) {
    this.stage = stage;
    this.assets = assets;
  }

  public add(entity: Entity) {
    this.entities.push(entity);
    this.sid_map[entity.sid] = entity;

    const rendered_entity = entity.init(this.assets);
    if (rendered_entity != undefined) this.stage.addChild(rendered_entity);
  }
}
