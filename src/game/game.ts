import {
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
  TextureStyle,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { ObjectManifest, manifest } from "../assets/manifest";
import { EntitiesManager } from "./entities";
import { Citizen } from "./entities/citizen";

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

  TextureStyle.defaultOptions.scaleMode = "nearest";

  Assets.loadBundle("game").then(
    (assets: ObjectManifest["bundles"]["game"]) => {
      const entities = new EntitiesManager(viewport, assets);
      viewport.addChild(
        TilingSprite.from(assets.bg, {
          width: viewport.worldWidth,
          height: viewport.worldHeight,
        })
      );

      app.stage.addChild(new Text({ text: "Hello world!" }));

      entities.add(new Citizen(1, 0, 0));

      app.ticker.add(({ deltaTime }) =>
        entities.entities.forEach((e) => e.step(deltaTime))
      );

      /*
      const sprite = new AnimatedSprite(
        assets.legs_run.animations.frame_row_3 as any
      );
      sprite.animationSpeed = 0.3;
      sprite.play();
      sprite.scale = 2;
      apply_palette(sprite);
      viewport.addChild(sprite);

      const body = new AnimatedSprite(assets.run.animations.frame_row_3 as any);
      body.animationSpeed = 0.3;
      body.play();
      body.scale = 2;

      apply_palette(body);
      viewport.addChild(body);

      const shield = new AnimatedSprite(
        assets.shield_wooden_run.animations.frame_row_3 as any
      );
      shield.animationSpeed = 0.3;
      shield.play();
      shield.scale = 2;

      apply_palette(shield);
      viewport.addChild(shield);
      */
    }
  );
};
