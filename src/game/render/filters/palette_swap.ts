import { vertex } from "pixi-filters";
import { Filter, GlProgram, Texture } from "pixi.js";
import fragment from "./palette_swap.frag?raw";

interface PaletteSwapFilterOptions {
  palette: Texture;
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
        uRed: { value: 0.9, type: "f32" },
        //uPalette: options.palette,
      },
    });

    console.log(this.resources);
  }
}
