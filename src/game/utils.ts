/*
import { ColorReplaceFilter } from "pixi-filters";
import { Sprite } from "pixi.js";
import palette from "../assets/palette";


class PaletteManager {
  private palette = [];

  private load(url: string): Promise<void> {
    return new Promise(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      const image = new Image();
      image.src = url;
      image.onload = function () {
        ctx.drawImage(image, 0, 0);

        for (let x = 0; x < image.width; x++) {
          for (let y = 0; y < image.width; y++) {
            const imageData: Uint8ClampedArray = ctx.getImageData(
              x,
              y,
              1,
              1
            ).data;
            const rgbColor: Array<number> = [
              imageData[0],
              imageData[1],
              imageData[2],
            ];
            return rgbColor;
          }
        }
      };
    });
  }
}

export function apply_palette(sprite: Sprite) {
  sprite.filters = [
    new ColorReplaceFilter({
      originalColor: "#0b0000",
      targetColor: palette.brown.secondary,
      tolerance: 0,
    }),
    new ColorReplaceFilter({
      originalColor: "#1b0000",
      targetColor: palette.brown.primary,
      tolerance: 0,
    }),
    new ColorReplaceFilter({
      originalColor: "#3b0000",
      targetColor: palette.brown.skin,
      tolerance: 0,
    }),
    new ColorReplaceFilter({
      originalColor: "#2b0000",
      targetColor: palette.brown.beard,
      tolerance: 0,
    }),
    new ColorReplaceFilter({
      originalColor: "#130000",
      targetColor: palette.brown.secondary2,
      tolerance: 0,
    }),
    new ColorReplaceFilter({
      originalColor: "#230000",
      targetColor: palette.brown.secondary3,
      tolerance: 0,
    }),
  ];
}
  */

import { Container, Sprite, Texture } from "pixi.js";
import { PaletteSwapFilter } from "./render/filters/palette_swap";

class PaletteManager {
  public texture: Texture | undefined = undefined;

  constructor(t?: Texture) {
    this.texture = t;
  }

  public apply_palette(container: Container | Sprite, row: number) {
    if (this.texture != undefined)
      container.filters = [
        new PaletteSwapFilter({ palette: this.texture, row }),
      ];
  }
}

export function lookAt(a: number, b: number, c: number, d: number) {
  var angle = Math.atan2(d - b, c - a);
  if (angle < 0) angle = Math.PI * 2 + angle;

  return angle;
}

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export const palette = new PaletteManager();
