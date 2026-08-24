import {
  ConstructorsInnerTypes,
  ConstructorsObject,
} from "../../common/constructors";

export type SendFunction = <T extends keyof ConstructorsObject>(
  msg: T,
  ...args: ConstructorsInnerTypes[T]
) => void;
