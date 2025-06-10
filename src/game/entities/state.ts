import { ObjectManifest } from "../../assets/manifest";
import { Entity } from "./entity";

export class StateManager<T = any> {
  public state: T | null = null;
  public duration = 0;

  private states: States;
  private entity: Entity;
  public assets?: ObjectManifest["bundles"]["game"];

  constructor(
    states: States,
    entity: Entity,
    //first_state: T,
    assets?: ObjectManifest["bundles"]["game"]
  ) {
    this.states = states;
    //this.set(first_state);
    this.entity = entity;
    this.assets = assets;
  }

  public set(state: T) {
    if (state == this.state) return;

    let s = this.states[this.state as keyof typeof this.states];

    if (this.state != null)
      if (s.leave != undefined && this.assets != undefined)
        s.leave(this.entity, this, this.assets);

    this.state = state;
    this.duration = 0;

    s = this.states[state as keyof typeof this.states];

    if (s.enter != undefined && this.assets != undefined)
      s.enter(this.entity, this, this.assets);
  }

  public render(dt: number, assets: ObjectManifest["bundles"]["game"]) {
    const state = this.states[this.state as keyof typeof this.states];
    if (state.render != undefined) state.render(dt, this.entity, this, assets);
  }

  public step(dt: number) {
    const state = this.states[this.state as keyof typeof this.states];
    if (state.step != undefined) state.step(dt, this.entity, this);
  }
}

export type States<T extends Entity = any> = {
  [name: string]: {
    enter?: (
      entity: T,
      manager: StateManager,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
    leave?: (
      entity: T,
      manager: StateManager,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
    step?: (dt: number, entity: T, manager: StateManager) => void;
    render?: (
      dt: number,
      entity: T,
      manager: StateManager,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
  };
};
