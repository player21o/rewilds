import {
  AnimatedSprite,
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { ObjectManifest, manifest } from "../assets/manifest";

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

  Assets.init({ manifest: manifest as any as AssetsManifest });
  Assets.backgroundLoadBundle(["game"]);

  Assets.loadBundle("game").then(
    (assets: ObjectManifest["bundles"]["game"]) => {
      viewport.addChild(
        TilingSprite.from(assets.bg, {
          width: viewport.worldWidth,
          height: viewport.worldHeight,
        })
      );

      console.log(assets);

      app.stage.addChild(new Text({ text: "Hello world!" }));

      const sprite = new AnimatedSprite(assets.key_atlas.animations.ss as any);
      sprite.animationSpeed = 0.5;
      sprite.play();
      sprite.scale = { x: 5, y: 5 };
      viewport.addChild(sprite);
    }
  );
};
