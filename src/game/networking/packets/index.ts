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
  update(__, { entities }, updates) {
    updates.forEach(([sid, bits, ...props]) => {
      const entity = entities.sid_map[sid];
      let prop_pointer = 0;
      //console.log(props);
      constructors_inner_keys[
        entity.constructor.name as keyof typeof constructors_inner_keys
      ].forEach((prop, i) => {
        //console.log((bits >> i) % 2 != 0);
        if ((bits >> i) % 2 != 0) {
          entity.shared[prop] = props[prop_pointer];

          prop_pointer += 1;
        }
      });
    });
  },
  snapshot(_, game, snapshot) {
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
