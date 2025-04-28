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
import { InputsManager } from "./input";

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

  const inputs = new InputsManager(viewport);

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

      entities.add(new Citizen(1, 0, 20));

      app.ticker.add(({ deltaTime }) =>
        entities.entities.forEach((e) => {
          e.step(deltaTime, inputs);
          e.render(deltaTime, inputs);
        })
      );
    }
  );
};
