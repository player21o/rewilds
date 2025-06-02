import {
  constructors_inner_keys,
  constructors_keys,
  constructors_object,
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
      const entity_exists = sid in entities.sid_map;

      const entity = entity_exists
        ? entities.sid_map[sid]
        : new entityClasses[
            constructors_keys[props[0]] as keyof typeof entityClasses
            //@ts-ignore
          ]({ sid });

      if (!entity_exists) props.shift();

      let prop_pointer = 0;
      constructors_inner_keys[
        entity.constructor.name as keyof typeof constructors_inner_keys
      ].forEach((prop, i) => {
        if ((bits >> i) % 2 != 0) {
          const networked_prop = props[prop_pointer];
          const formatted_prop =
            //@ts-ignore
            constructors_object[
              entity.constructor.name as keyof typeof constructors_object
            ][prop][1](networked_prop);

          entity.shared[prop] = formatted_prop;

          prop_pointer += 1;
        }
      });

      if (!entity_exists) entities.add(entity);
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
            //@ts-ignore
            constructors_object[
              constructorName as keyof typeof constructors_object
            ][prop][1](props[i]),
          ])
        )
      );

      game.entities.add(entity);
    });
  },
  your_sid(_, { me, entities }, sid) {
    me.citizen = entities.sid_map[sid] as Citizen;
  },
  private(_, { me }, bits, data) {
    let prop_pointer = 0;
    constructors_inner_keys["CitizenPrivateData"].forEach((prop, i) => {
      if ((bits >> i) % 2 != 0) {
        const networked_prop = data[prop_pointer];
        const formatted_prop =
          //@ts-ignore
          constructors_object["CitizenPrivateData"][prop][1](networked_prop);

        me.private_data[prop] = formatted_prop;

        prop_pointer += 1;
      }
    });
    me.update_private_data();
  },
} as Packets;
