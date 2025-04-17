import { Application, Assets, Text, TilingSprite } from "pixi.js";
import tile from "../assets/tile_desert.png";
import { Viewport } from "pixi-viewport";

export default (app: Application) => {
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,
    events: app.renderer.events,
  });

  app.stage.addChild(viewport);
  viewport.drag().pinch().wheel().decelerate();

  Assets.load(tile).then((txt) => {
    //console.log(txt);
    viewport.addChild(
      TilingSprite.from(txt, {
        width: app.canvas.width,
        height: app.canvas.height,
      })
    );

    app.stage.addChild(new Text({ text: "Hello world!" }));
  });
};
