import { GameObject } from "../objects/object";

/**
 * basically a networked gameobject
 */

export class Entity<T extends object = any> extends GameObject {
  public sid: number;
  public shared: T;

  public constructor(shared: T & { sid: number }) {
    super();
    this.sid = shared.sid;
    this.shared = shared;
  }
}
