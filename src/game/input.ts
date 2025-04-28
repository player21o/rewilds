import { IFederatedContainer } from "pixi.js";

export class InputsManager {
  public mouseX: number = 0;
  public mouseY: number = 0;

  public constructor(stage: IFederatedContainer) {
    stage.addEventListener("pointermove", (e) => {
      this.mouseX = e.globalX;
      this.mouseY = e.globalY;
    });
  }
}
