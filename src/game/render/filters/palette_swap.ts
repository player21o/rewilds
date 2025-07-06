import { vertex } from "./default_shaders";
import { Filter, GlProgram, Texture } from "pixi.js";
import fragment from "./palette_swap.frag?raw";

interface PaletteSwapFilterOptions {
  palette: Texture;
  row: number;
}

export class PaletteSwapFilter extends Filter {
  constructor(options: PaletteSwapFilterOptions) {
    super({
      antialias: false,
      glProgram: GlProgram.from({
        vertex: vertex,
        fragment: fragment,
        name: "palette-swap-filter",
      }),
      blendMode: "normal-npm",
      resources: {
        uniforms: {
          uRow: { value: options.row, type: "f32" },
          uPaletteStepX: { value: 1.0 / 64.0, type: "f32" },
          uPaletteY: { value: options.row * (1.0 / 64.0), type: "f32" },
        },
        uPalette: options.palette.source,
      },
    });
  }
}
