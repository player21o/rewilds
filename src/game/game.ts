import {
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
  TextureStyle,
  Texture,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { ObjectManifest, manifest } from "../assets/manifest";
import { EntitiesManager } from "./entities";
import { Citizen } from "./entities/citizen";
import { InputsManager } from "./input";
import { WS } from "./networking";

export default (app: Application, socket: WebSocket) => {
  const ws = new WS(socket);
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,
    events: app.renderer.events,
  });

  app.stage.addChild(viewport);
  //viewport.drag().pinch().wheel().decelerate();

  Assets.init({ manifest: manifest as any as AssetsManifest });
  Assets.backgroundLoadBundle(["game"]);

  TextureStyle.defaultOptions.scaleMode = "nearest";

  const inputs = new InputsManager(viewport);

  Assets.loadBundle("game").then(
    (assets: ObjectManifest["bundles"]["game"]) => {
      (assets.palette as any as Texture).source.style.magFilter = "nearest";
      (assets.palette as any as Texture).source.style.minFilter = "nearest";
      (assets.palette as any as Texture).source.style.mipmapFilter = "nearest";
      (assets.palette as any as Texture).source.update();
      const entities = new EntitiesManager(viewport, assets);
      viewport.addChild(
        TilingSprite.from(assets.bg, {
          width: viewport.worldWidth,
          height: viewport.worldHeight,
        })
      );

      app.stage.addChild(new Text({ text: "Hello world!" }));

      const citizen = new Citizen(1, 250, 250);
      entities.add(citizen);
      //viewport.moveCenter(citizen.x + 300, citizen.y);
      setInterval(
        () =>
          //viewport.follow(citizen.container, { acceleration: 0.2, speed: 1 }),
          1000
      );

      app.ticker.add(({ deltaTime }) =>
        entities.entities.forEach((e) => {
          //console.log(deltaTime);
          e.step(deltaTime, inputs);
          e.render(deltaTime, inputs, assets);
        })
      );
    }
  );
};
