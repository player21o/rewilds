import { Container, Point, Ticker } from "pixi.js";

interface Options {
  width: number;
  height: number;
}

export class Viewport extends Container {
  public worldWidth: number;
  public worldHeight: number;

  constructor({ width, height }: Options) {
    super({ width, height, eventMode: "auto" });

    this.worldWidth = width;
    this.worldHeight = height;
  }

  public toWorld(x: number, y: number): Point {
    return new Point(this.x + x, this.y + y);
  }

  public follow(container: Container) {
    Ticker.shared.add(() => {
      this.x = -container.x + window.screen.width / 4;
      this.y = -container.y + window.screen.height / 4;
    });
  }
}
