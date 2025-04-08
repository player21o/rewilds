import { Application, Assets, Text, TilingSprite } from "pixi.js";
import tile from "../assets/tile_desert.png";

export default (app: Application) => {
  Assets.load(tile).then((txt) => {
    //console.log(txt);
    app.stage.addChild(
      TilingSprite.from(txt, {
        width: app.canvas.width,
        height: app.canvas.height,
      })
    );

    app.stage.addChild(new Text({ text: "Hello world!" }));
  });
};
