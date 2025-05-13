import { Packets } from "../types";

export default {
  hello(ws, _) {
    ws.send("hello");
  },
  update(__, _, updates) {
    //console.log(updates);
  },
  snapshot(_, __, snapshot) {
    snapshot.forEach((entity) => {});
  },
} as Packets;
