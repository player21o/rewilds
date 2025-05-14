import {
  ConstructorsInnerTypes,
  ConstructorsObject,
} from "../../common/constructors";
import { GameDependencies } from "../game_deps";

export type Packets = {
  [T in keyof ConstructorsInnerTypes]: Packet<T>;
};

export type Packet<T extends keyof ConstructorsInnerTypes> = (
  arg0: <T extends keyof ConstructorsObject>(
    msg: T,
    ...args: ConstructorsInnerTypes[T]
  ) => void,
  arg1: GameDependencies,
  ...args: ConstructorsInnerTypes[T]
) => {};
