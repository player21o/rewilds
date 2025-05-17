import { Viewport } from "./render/viewport";

export class InputsManager {
  private _canvasMouseX: number = 0;
  private _canvasMouseY: number = 0;
  private _viewport: Viewport;

  private pressedKeysMap: { [key: string]: boolean } = {};
  //private keysCallbacks: () => void) = [];
  private pressedKeysCallbacks: { [key: string]: (() => void)[] } = {};
  private anyPressedKeysCallbacks: ((arg0: string) => void)[] = [];

  private releasedKeysCallbacks: { [key: string]: (() => void)[] } = {};
  private anyReleasedKeysCallbacks: ((arg0: string) => void)[] = [];

  private mouseMovedCallbacks: ((arg0: typeof this) => void)[] = [];

  public constructor(viewport: Viewport) {
    this._viewport = viewport;
    viewport.onpointermove = (e) => {
      this._canvasMouseX = e.globalX;
      this._canvasMouseY = e.globalY;

      this.mouseMovedCallbacks.forEach((cb) => cb(this));
    };

    window.onkeydown = (e) => {
      this.pressedKeysMap[e.key] = true;

      if (e.repeat) return;

      if (e.key in this.pressedKeysCallbacks)
        this.pressedKeysCallbacks[e.key].forEach((callback) => callback());

      this.anyPressedKeysCallbacks.forEach((cb) => cb(e.key));
    };

    window.onkeyup = (e) => {
      this.pressedKeysMap[e.key] = false;

      if (e.repeat) return;

      if (e.key in this.releasedKeysCallbacks)
        this.releasedKeysCallbacks[e.key].forEach((callback) => callback());

      this.anyReleasedKeysCallbacks.forEach((cb) => cb(e.key));
    };
  }

  public is_key_pressed(key: string) {
    return key in this.pressedKeysMap ? this.pressedKeysMap[key] : false;
  }

  public on_key_pressed(key: string, callback: () => void) {
    this.pressedKeysCallbacks[key] = [];
    this.pressedKeysCallbacks[key].push(callback);
  }

  public on_key_released(key: string, callback: () => void) {
    this.releasedKeysCallbacks[key] = [];
    this.releasedKeysCallbacks[key].push(callback);
  }

  public on_any_key_pressed(callback: (key: string) => void) {
    this.anyPressedKeysCallbacks.push(callback);
  }

  public on_any_key_released(callback: (key: string) => void) {
    this.anyReleasedKeysCallbacks.push(callback);
  }

  public on_mouse_move(callback: (arg0: typeof this) => void) {
    this.mouseMovedCallbacks.push(callback);
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

  get canvasMouseX() {
    return this._canvasMouseX;
  }

  get canvasMouseY() {
    return this._canvasMouseY;
  }
}
