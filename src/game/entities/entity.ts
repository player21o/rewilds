import { GameObject } from "../objects/object";

export class Entity<T extends object = any> extends GameObject {
  public sid: number;
  public shared: T;
  public x: number = 0;
  public y: number = 0;

  public constructor(shared: T & { sid: number }) {
    super();
    this.sid = shared.sid;
    this.shared = shared;
  }
}
