import { ConstructorsObject } from "../common/constructors";
import { EntitiesManager } from "./entities";
import { Citizen } from "./entities/citizen";
import { InputsManager } from "./input";
import { SendFunction } from "./networking/types";

export class MyPlayer {
  private _citizen: Citizen | null = null;
  private send: SendFunction;
  private keys = 0;
  private last_mouse_packet = 0;
  private entities: EntitiesManager;

  public potential_sid: number | undefined = undefined;

  public private_data: ConstructorsObject["CitizenPrivateData"] = {
    stamina: 0,
  };

  constructor(
    send: SendFunction,
    inputs: InputsManager,
    entities: EntitiesManager
  ) {
    this.send = send;

    ["w", "a", "s", "d"].forEach((key) => {
      inputs.on_key_pressed(key, this.key_callback(inputs));
      inputs.on_key_released(key, this.key_callback(inputs));
    });

    inputs.on_mouse_move(this.mouse_callback());
    inputs.on_right_button_pressed(this.right_mouse_down_callback());
    inputs.on_right_button_released(this.right_mouse_up_callback());

    entities.on_entity_created(this.on_entity_created_cb(this.test_if_enemy));
    this.entities = entities;
  }

  public update_private_data() {
    if (this.citizen == null) return;
    //console.log(this.private_data);
    this.citizen.bar_params.stamina = this.private_data.stamina;
  }

  private on_entity_created_cb(test: (e: Citizen) => boolean) {
    return (e: any) => {
      if (e instanceof Citizen) e.bar_params.enemy = test(e);
    };
  }

  private test_if_enemy(e: Citizen) {
    return e.shared.team == 2;
  }

  private right_mouse_down_callback(): (arg0: InputsManager) => void {
    return () => {
      this.send("action", "growl_start");
    };
  }

  private right_mouse_up_callback(): (arg0: InputsManager) => void {
    return () => {
      this.send("action", "growl_stop");
    };
  }

  private mouse_callback(): (arg0: InputsManager) => void {
    return ({ mouseX, mouseY }: InputsManager) => {
      if (
        this.citizen != null &&
        Date.now() - this.last_mouse_packet > 1000 / 30
      ) {
        this.send("pointer", mouseX - this.citizen.x, mouseY - this.citizen.y);
        this.last_mouse_packet = Date.now();
      }
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

    this.citizen!.bar_params.enemy = false;

    this.entities.entities.forEach((e) => {
      if (e instanceof Citizen && e.sid != this.citizen!.sid)
        e.bar_params.enemy = this.test_if_enemy(e);
    });
  }
}
