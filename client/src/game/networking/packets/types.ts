import { ConstructorsInnerTypes } from "../../../common/constructors";
import { GameDependencies } from "../../game_deps";
import { SendFunction } from "../types";

export type Packets = {
  [T in keyof ConstructorsInnerTypes]: Packet<T>;
};

export type Packet<T extends keyof ConstructorsInnerTypes> = (
  arg0: SendFunction,
  arg1: GameDependencies,
  ...args: ConstructorsInnerTypes[T]
) => {};
