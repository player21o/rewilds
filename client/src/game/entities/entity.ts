import { ConstructorsObject } from "../../common/constructors";
import { GameObject } from "../objects/object";

/**
 * basically a networked gameobject
 */

export class Entity<T extends object = any> extends GameObject {
  public sid: number;
  public shared: T;
  public constructor_name: keyof ConstructorsObject;

  public constructor(
    shared: T & { sid: number },
    constructor_name: keyof ConstructorsObject
  ) {
    super();
    this.sid = shared.sid;
    this.shared = shared;
    this.constructor_name = constructor_name;
  }
}
