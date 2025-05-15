import { Citizen } from "./entities/citizen";
import { SendFunction } from "./networking/types";

export class MyPlayer {
  private _citizen: Citizen | null = null;
  private send: SendFunction;

  constructor(send: SendFunction) {
    this.send = send;
  }

  get citizen() {
    return this._citizen;
  }

  set citizen(value: Citizen | null) {
    this._citizen = value;
  }
}
