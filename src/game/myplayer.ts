import { Citizen } from "./entities/citizen";
import { WS } from "./networking";

export class MyPlayer {
  public citizen: Citizen | null = null;

  constructor(ws: WS) {}
}
