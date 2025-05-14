import { decode, encode } from "@msgpack/msgpack";
import {
  constructors_inner_keys,
  constructors_keys,
  constructors_object,
  ConstructorsInnerTypes,
  ConstructorsObject,
} from "../../common/constructors";
import packets from "./packets";
import { GameDependencies } from "../game_deps";

export class WS {
  private ws: WebSocket;
  private game: GameDependencies;

  constructor(game: GameDependencies, ws: WebSocket) {
    this.ws = ws;
    this.game = game;

    ws.onmessage = ({ data }) => {
      (data as Blob).arrayBuffer().then((buffer) => {
        const packet: [packet: number, ...args: any[]] = decode(buffer) as any;

        const formatted: any[] = [];
        const sliced = packet[1];
        const constructor_name = constructors_keys[packet[0]];
        const constructor = constructors_object[constructor_name];
        const props = constructors_inner_keys[constructor_name];

        for (let i = 0, n = sliced.length; i < n; ++i) {
          const propName = props[i] as keyof typeof constructor;
          const converterPair = constructor[propName] as readonly [
            (val: any) => any,
            (val: any) => any
          ];

          formatted.push(converterPair[1](sliced[i]));
        }

        console.log(formatted[0]);

        packets[constructor_name](this.send, this.game, formatted[0] as any);
      });
    };
  }

  public send<T extends keyof ConstructorsObject>(
    msg: T,
    ...args: ConstructorsInnerTypes[T]
  ) {
    const constructor = constructors_object[msg];

    const data = constructors_inner_keys[msg].map((prop, i) => {
      const propName = prop as keyof typeof constructor;
      const converterPair = constructor[propName] as readonly [
        (val: any) => any,
        (val: any) => any
      ];

      return converterPair[0](args[i]);
    });

    this.ws.send(encode([constructors_keys.indexOf(msg), data]));
  }
}
