import { Viewport } from "pixi-viewport";

export class InputsManager {
  public mouseX: number = 0;
  public mouseY: number = 0;
  private pressedKeysMap: { [key: string]: boolean } = {};

  public constructor(viewport: Viewport) {
    viewport.onpointermove = (e) => {
      const world = viewport.toWorld(e.globalX, e.globalY);

      this.mouseX = world.x;
      this.mouseY = world.y;
    };

    window.onkeydown = (e) => {
      this.pressedKeysMap[e.key] = true;
    };

    window.onkeyup = (e) => {
      this.pressedKeysMap[e.key] = false;
    };
  }

  public is_key_pressed(key: string) {
    return key in this.pressedKeysMap ? this.pressedKeysMap[key] : false;
  }
}
