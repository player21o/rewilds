import { WS } from ".";
import { ConstructorsInnerTypes } from "../../common/constructors";
import { GameManager } from "../game";

export type Packets = {
  [T in keyof ConstructorsInnerTypes]: Packet<T>;
};

export type Packet<T extends keyof ConstructorsInnerTypes> = (
  arg0: WS,
  arg1: GameManager,
  ...args: ConstructorsInnerTypes[T]
) => {};
