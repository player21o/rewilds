import { RenderLayer } from "pixi.js";

export default {
  ground: new RenderLayer(),
  entities: new RenderLayer({ sortableChildren: true }),
  stop: function () {
    this.entities.detachAll();
    this.ground.detachAll();
  },
};
