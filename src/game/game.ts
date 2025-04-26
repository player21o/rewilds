import {
  AnimatedSprite,
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
  TextureStyle,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { ObjectManifest, manifest } from "../assets/manifest";
import { ColorReplaceFilter } from "pixi-filters";
import palette from "../assets/palette";

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
      viewport.addChild(
        TilingSprite.from(assets.bg, {
          width: viewport.worldWidth,
          height: viewport.worldHeight,
        })
      );

      console.log(assets);

      app.stage.addChild(new Text({ text: "Hello world!" }));

      const sprite = new AnimatedSprite(
        assets.legs_run.animations.frame_row_3 as any
      );
      sprite.animationSpeed = 0.3;
      sprite.play();
      sprite.scale = 2;
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
      ];
      viewport.addChild(sprite);

      const body = new AnimatedSprite(assets.run.animations.frame_row_3 as any);
      body.animationSpeed = 0.3;
      body.play();
      body.scale = 2;

      body.filters = [
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
      viewport.addChild(body);

      const shield = new AnimatedSprite(
        assets.shield_wooden_run.animations.frame_row_3 as any
      );
      shield.animationSpeed = 0.3;
      shield.play();
      shield.scale = 2;

      shield.filters = [
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
      viewport.addChild(shield);
    }
  );
};
