import { Viewport } from "pixi-viewport";

export class InputsManager {
  private _canvasMouseX: number = 0;
  private _canvasMouseY: number = 0;
  private _viewport: Viewport;

  private pressedKeysMap: { [key: string]: boolean } = {};
  //private keysCallbacks: () => void) = [];
  private keysCallbacks: { [key: string]: (() => void)[] } = {};

  public constructor(viewport: Viewport) {
    this._viewport = viewport;
    viewport.onpointermove = (e) => {
      this._canvasMouseX = e.globalX;
      this._canvasMouseY = e.globalY;
    };

    window.onkeydown = (e) => {
      this.pressedKeysMap[e.key] = true;

      if (e.key in this.keysCallbacks)
        this.keysCallbacks[e.key].forEach((callback) => callback());
    };

    window.onkeyup = (e) => {
      this.pressedKeysMap[e.key] = false;
    };
  }

  public is_key_pressed(key: string) {
    return key in this.pressedKeysMap ? this.pressedKeysMap[key] : false;
  }

  public on_key_pressed(key: string, callback: () => void) {
    this.keysCallbacks[key] = [];
    this.keysCallbacks[key].push(callback);
  }

  get mouseX() {
    return this._viewport.toWorld(this._canvasMouseX, this._canvasMouseY).x;
  }

  get mouseY() {
    return this._viewport.toWorld(this._canvasMouseX, this._canvasMouseY).y;
  }

  get mousePos() {
    return this._viewport.toWorld(this._canvasMouseX, this._canvasMouseY);
  }
}
