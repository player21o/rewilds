import { RenderLayer } from "pixi.js";

export default {
  ground: new RenderLayer(),
  entities: new RenderLayer({ sortableChildren: true }),
};
