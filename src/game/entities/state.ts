import { ObjectManifest } from "../../assets/manifest";
import { Entity } from "./entity";

export class StateManager<T = any> {
  public state: T | null = null;
  public duration = 0;

  private states: States;
  private entity: Entity;

  constructor(states: States, entity: Entity, first_state: T) {
    this.states = states;
    this.set(first_state);
    this.entity = entity;
  }

  public set(state: T) {
    if (this.state != null)
      this.states[this.state as keyof typeof this.states].leave(
        this.entity,
        this
      );

    this.state = state;
    this.duration = 0;

    this.states[this.state as keyof typeof this.states].enter(
      this.entity,
      this
    );
  }

  public render(dt: number, assets: ObjectManifest["bundles"]["game"]) {
    this.states[this.state as keyof typeof this.states].render(
      dt,
      this.entity,
      this,
      assets
    );
  }

  public step(dt: number) {
    this.states[this.state as keyof typeof this.states].step(
      dt,
      this.entity,
      this
    );
  }
}

export type States<T extends Entity = any> = {
  [name: string]: {
    enter: (entity: T, manager: StateManager) => void;
    leave: (entity: T, manager: StateManager) => void;
    step: (dt: number, entity: T, manager: StateManager) => void;
    render: (
      dt: number,
      entity: T,
      manager: StateManager,
      assets: ObjectManifest["bundles"]["game"]
    ) => void;
  };
};
