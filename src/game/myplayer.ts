import { Citizen } from "./entities/citizen";
import { InputsManager } from "./input";
import { SendFunction } from "./networking/types";
import { Viewport } from "./render/viewport";

export class MyPlayer {
  private _citizen: Citizen | null = null;
  private send: SendFunction;
  private viewport: Viewport;
  private keys = 0;

  constructor(send: SendFunction, inputs: InputsManager, v: Viewport) {
    this.send = send;
    this.viewport = v;

    ["w", "a", "s", "d"].forEach((key) => {
      inputs.on_key_pressed(key, this.key_callback(inputs));
      inputs.on_key_released(key, this.key_callback(inputs));
    });

    inputs.on_mouse_move(this.mouse_callback());
  }

  private mouse_callback(): (arg0: InputsManager) => void {
    return ({ mouseX, mouseY }: InputsManager) => {
      if (this.citizen != null)
        this.send("pointer", mouseX - this.citizen.x, mouseY - this.citizen.y);
    };
  }

  private key_callback(inputs: InputsManager) {
    return () => {
      const keys = ["w", "a", "s", "d"];
      let bits = 0;

      keys.forEach((key, i) => {
        if (inputs.is_key_pressed(key)) {
          bits |= 1 << i;
        }
      });

      if (this.keys != bits) {
        this.keys = bits;
        this.send("keys", bits);
      }
    };
  }

  get citizen() {
    return this._citizen;
  }

  set citizen(value: Citizen | null) {
    this._citizen = value;
    if (value != null) this.viewport.follow(value.container);
  }
}
