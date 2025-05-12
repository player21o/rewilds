import { Packets } from "../types";

export default {
  hello(ws, _) {
    ws.send("hello");
  },
  update(__, _, updates) {
    console.log(updates);
  },
} as Packets;
