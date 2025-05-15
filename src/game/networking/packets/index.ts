import {
  constructors_inner_keys,
  constructors_keys,
} from "../../../common/constructors";
import { entityClasses } from "../../entities";
import { Citizen } from "../../entities/citizen";
import { Packets } from "./types";

export default {
  hello(send, _) {
    send("hello");
  },
  update(__, _, ___) {
    //console.log(updates);
  },
  snapshot(_, game, snapshot) {
    console.log(JSON.stringify(snapshot));
    snapshot.forEach(([constructor, ...props]) => {
      const constructorName = constructors_keys[constructor];
      const entity = new entityClasses[
        constructorName as keyof typeof entityClasses
      ](
        //@ts-ignore
        Object.fromEntries(
          constructors_inner_keys[constructorName].map((prop, i) => [
            prop,
            props[i],
          ])
        )
      );

      game.entities.add(entity);
    });
  },
  your_sid(_, { me, entities }, sid) {
    me.citizen = entities.sid_map[sid] as Citizen;
  },
} as Packets;
