import { Viewport } from "pixi-viewport";
import { EntitiesManager } from "./entities";
import { InputsManager } from "./input";

export class GameDependencies {
  public entities: EntitiesManager;
  //public ws: WS;
  public inputs: InputsManager;

  constructor(viewport: Viewport) {
    //this.ws = new WS(this, socket);
    this.entities = new EntitiesManager(viewport);
    this.inputs = new InputsManager(viewport);
  }
}
