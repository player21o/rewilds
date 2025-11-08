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
    charging: false,
  };

  constructor(
    send: SendFunction,
    inputs: InputsManager,
    entities: EntitiesManager
  ) {
    this.send = send;

    ["KeyW", "KeyA", "KeyS", "KeyD"].forEach((key) => {
      inputs.on_key_pressed(key, this.key_callback(inputs));
      inputs.on_key_released(key, this.key_callback(inputs));
    });

    inputs.on_mouse_move(this.mouse_callback());
    inputs.on_right_button_pressed(this.right_mouse_down_callback());
    inputs.on_right_button_released(this.right_mouse_up_callback());
    inputs.on_left_button_pressed(this.left_mouse_down_callback());
    inputs.on_left_button_released(this.left_mouse_up_callback());
    inputs.onwheel = (d) => (d > 0 ? this.send("action", "block") : null);

    entities.on_entity_created(this.on_entity_created_cb(this.test_if_enemy));
    this.entities = entities;
  }

  public update_private_data() {
    if (this.citizen == null) return;

    this.citizen.bar_params.stamina = this.private_data.stamina;
    this.citizen.bar_params.charging = this.private_data.charging;
    this.citizen.bar_params.hide_stamina = false;

    this.citizen.update_bars(1);
  }

  private on_entity_created_cb(test: (e: Citizen) => boolean) {
    return (e: any) => {
      if (e instanceof Citizen) {
        e.bar_params.enemy = test.bind(this)(e);
        e.update_bars(1);
      }
    };
  }

  private test_if_enemy(e: Citizen) {
    return (
      this.citizen != null &&
      ((e.shared.team == 2 && e.sid != this.citizen.sid) ||
        e.shared.team != this.citizen.shared.team)
    );
  }

  private left_mouse_down_callback(): (arg0: InputsManager) => void {
    return () => {
      this.send("action", "left_button_start");
    };
  }

  private left_mouse_up_callback(): (arg0: InputsManager) => void {
    return () => {
      this.private_data.charging = false;
      this.update_private_data();
      this.send("action", "left_button_finish");
    };
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
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD"];
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
    this.update_private_data();
    console.log(value);

    this._citizen!.bar_params.enemy = false;

    this.entities.entities.forEach((e) => {
      if (e instanceof Citizen && e.sid != this.citizen!.sid) {
        e.bar_params.enemy = this.test_if_enemy(e);
        e.update_bars(0);
      }
    });
  }
}
