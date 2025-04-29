import { Viewport } from "pixi-viewport";

export class InputsManager {
  public mouseX: number = 0;
  public mouseY: number = 0;

  public constructor(viewport: Viewport) {
    viewport.addEventListener("pointermove", (e) => {
      const world = viewport.toWorld(e.globalX, e.globalY);

      this.mouseX = world.x;
      this.mouseY = world.y;
    });
  }
}
