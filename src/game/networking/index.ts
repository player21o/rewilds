import { decode, encode } from "@msgpack/msgpack";
import {
  constructors_inner_keys,
  constructors_keys,
  constructors_object,
  ConstructorsInnerTypes,
  ConstructorsObject,
} from "../../common/constructors";
import packets from "./packets";

export class WS {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;

    ws.onmessage = ({ data }) => {
      const packet: [
        packet: number,
        ...args: Parameters<(typeof packets)[keyof typeof packets]>
      ] = decode(data) as any;

      const formatted: any[] = [];
      const sliced = packet.slice(1);
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

      packets[constructor_name](this, formatted as any);
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
