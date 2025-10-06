import { Viewport } from "pixi-viewport";

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
  private onLeftButtonPressedCallbacks: ((arg0: typeof this) => void)[] = [];
  private onRightButtonPressedCallbacks: ((arg0: typeof this) => void)[] = [];
  private onLeftButtonReleasedCallbacks: ((arg0: typeof this) => void)[] = [];
  private onRightButtonReleasedCallbacks: ((arg0: typeof this) => void)[] = [];

  public constructor(viewport: Viewport) {
    this._viewport = viewport;
    viewport.onpointermove = (e) => {
      this._canvasMouseX = e.globalX;
      this._canvasMouseY = e.globalY;

      this.mouseMovedCallbacks.forEach((cb) => cb(this));
    };

    window.onmousedown = (e) => {
      e.preventDefault();

      if (e.button == 0)
        this.onLeftButtonPressedCallbacks.forEach((cb) => cb(this));

      if (e.button == 2)
        this.onRightButtonPressedCallbacks.forEach((cb) => cb(this));
    };

    window.onmouseup = (e) => {
      e.preventDefault();

      if (e.button == 0)
        this.onLeftButtonReleasedCallbacks.forEach((cb) => cb(this));

      if (e.button == 2)
        this.onRightButtonReleasedCallbacks.forEach((cb) => cb(this));
    };

    window.onkeydown = (e) => {
      this.pressedKeysMap[e.code] = true;

      if (e.repeat) return;

      if (e.code in this.pressedKeysCallbacks)
        this.pressedKeysCallbacks[e.code].forEach((callback) => callback());

      this.anyPressedKeysCallbacks.forEach((cb) => cb(e.code));
    };

    window.onkeyup = (e) => {
      this.pressedKeysMap[e.code] = false;

      if (e.repeat) return;

      if (e.code in this.releasedKeysCallbacks)
        this.releasedKeysCallbacks[e.code].forEach((callback) => callback());

      this.anyReleasedKeysCallbacks.forEach((cb) => cb(e.code));
    };
  }

  set onwheel(cb: (direction: -1 | 1) => void) {
    window.onwheel = ({ deltaY }) => cb(deltaY > 0 ? 1 : -1);
  }

  public stop() {
    this.anyPressedKeysCallbacks = [];
    this.anyReleasedKeysCallbacks = [];
    this.mouseMovedCallbacks = [];
    this.pressedKeysCallbacks = {};
    this.onLeftButtonPressedCallbacks = [];
    this.onRightButtonPressedCallbacks = [];
    this.onLeftButtonReleasedCallbacks = [];
    this.onRightButtonReleasedCallbacks = [];
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

  public on_left_button_pressed(callback: (arg0: typeof this) => void) {
    this.onLeftButtonPressedCallbacks.push(callback);
  }

  public on_right_button_pressed(callback: (arg0: typeof this) => void) {
    this.onRightButtonPressedCallbacks.push(callback);
  }

  public on_left_button_released(callback: (arg0: typeof this) => void) {
    this.onLeftButtonReleasedCallbacks.push(callback);
  }

  public on_right_button_released(callback: (arg0: typeof this) => void) {
    this.onRightButtonReleasedCallbacks.push(callback);
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
