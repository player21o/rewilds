import { Packets } from "../types";

export default {
  hello(ws, _) {
    ws.send("hello");
  },
  update(__, game, updates) {
    updates.forEach((update) => {
      //game.entities.forEach
    });
  },
} as Packets;
