import { Viewport } from "pixi-viewport";
import { EntitiesManager } from "./entities";
import { InputsManager } from "./input";
import { MyPlayer } from "./myplayer";
import { SendFunction } from "./networking/types";

export class GameDependencies {
  public entities: EntitiesManager;
  //public ws: WS;
  public inputs: InputsManager;
  public me!: MyPlayer;
  public viewport: Viewport;

  constructor(viewport: Viewport, send?: SendFunction) {
    //this.ws = new WS(this, socket);
    this.entities = new EntitiesManager(viewport);
    this.inputs = new InputsManager(viewport);
    this.viewport = viewport;

    if (send != undefined)
      this.me = new MyPlayer(send, this.inputs, this.entities);
  }

  public stop() {
    this.inputs.stop();
    this.entities.stop();
  }

  public setMeSendFunction(send: SendFunction) {
    this.me = new MyPlayer(send, this.inputs, this.entities);
  }
}
