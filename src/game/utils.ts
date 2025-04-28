import { ColorReplaceFilter } from "pixi-filters";
import { Sprite } from "pixi.js";
import palette from "../assets/palette";

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

export function lookAt(a: number, b: number, c: number, d: number) {
  var angle = Math.atan2(d - b, c - a);
  if (angle < 0) angle = Math.PI * 2 + angle;

  return angle;
}
