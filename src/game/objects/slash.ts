import { AnimatedSprite, Container } from "pixi.js";
import { ObjectManifest } from "../../assets/manifest";
import layers from "../render/layers";
import { GameObject } from "./object";
import { Entity } from "../entities/entity";

export default class Slash extends GameObject {
  private entity: Entity;
  private slash: string;

  constructor(entity: Entity, slash: string) {
    super();

    this.entity = entity;
    this.slash = slash;
  }

  public init(
    assets: ObjectManifest["bundles"]["game"],
    layers_collection: typeof layers
  ) {
    //const container = new AnimatedSprite(assets[("slash_" + slash) as any]);

    return container;
  }
}
