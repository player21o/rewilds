import { ObjectManifest } from "../../assets/manifest";
import { GameDependencies } from "../game_deps";
import { Entity } from "./entity";

export class StateManager<T = any> {
  public state: T | null = null;
  public duration = 0;
  public prev_state: T | null = null;

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

  public set(state: T, dp: GameDependencies) {
    if (state == this.state) return;

    let s = this.states[this.state as keyof typeof this.states];

    if (this.state != null)
      if (s.leave != undefined && this.assets != undefined)
        s.leave(this.entity, this, this.assets);

    this.prev_state = this.state;

    this.state = state;
    this.duration = 0;

    s = this.states[state as keyof typeof this.states];

    if (s.enter != undefined && this.assets != undefined)
      s.enter(this.entity, this, this.assets, dp);
  }

  /*
  public render(
    dt: number,
    dp: GameDependencies,
    assets: ObjectManifest["bundles"]["game"]
  ) {
    const state = this.states[this.state as keyof typeof this.states];
    if (state.render != undefined)
      state.render(dt, this.entity, dp, this, assets);
  }
    */

  public step(
    dt: number,
    dp: GameDependencies,
    assets: ObjectManifest["bundles"]["game"]
  ) {
    this.duration += dt / 100;
    const state = this.states[this.state as keyof typeof this.states];
    if (state.step != undefined) state.step(dt, this.entity, dp, this, assets);
  }
}

export type States<
  T extends Entity = any,
  S extends string | number | symbol = any
> = {
  [A in S]: {
    enter?: (
      entity: T,
      manager: StateManager<S>,
      assets: ObjectManifest["bundles"]["game"],
      dp: GameDependencies
    ) => void;
    leave?: (
      entity: T,
      manager: StateManager<S>,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
    step?: (
      dt: number,
      entity: T,
      dp: GameDependencies,
      manager: StateManager<S>,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
    /*
    render?: (
      dt: number,
      entity: T,
      dp: GameDependencies,
      manager: StateManager,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
     */
  };
};
