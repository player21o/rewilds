import type { WS } from "..";
import { ConstructorsInnerTypes } from "../../../common/constructors";

type Packets = {
  [Packet in keyof ConstructorsInnerTypes]: (
    arg0: WS,
    ...args: ConstructorsInnerTypes[Packet]
  ) => {};
};

export default {
  pointer(_, __, ___) {},
  hello(_) {
    console.log("received hello packet");
  },
} as Packets;
