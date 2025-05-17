import {
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
  TextureStyle,
} from "pixi.js";
import { ObjectManifest, manifest } from "../assets/manifest";
import { EntitiesManager } from "./entities";
import { palette } from "./utils";
import { GameDependencies } from "./game_deps";
import { WS } from "./networking";
import { Viewport } from "./render/viewport";

export class GameManager {
  public deps: GameDependencies;

  constructor(app: Application, socket: WebSocket) {
    const viewport = new Viewport({ width: 1000, height: 1000 });

    app.stage.addChild(viewport);

    Assets.init({ manifest: manifest as any as AssetsManifest });
    Assets.backgroundLoadBundle(["game"]);

    TextureStyle.defaultOptions.scaleMode = "nearest";

    this.deps = new GameDependencies(viewport);
    const ws = new WS(this.deps, socket);
    this.deps.setMeSendFunction(ws.send);

    Assets.loadBundle("game").then(
      (assets: ObjectManifest["bundles"]["game"]) => {
        palette.texture = assets.palette;

        assets.palette.source.style.magFilter = "nearest";
        assets.palette.source.style.minFilter = "nearest";
        assets.palette.source.style.mipmapFilter = "nearest";
        assets.palette.source.update();

        this.deps.entities = new EntitiesManager(viewport, assets);
        viewport.addChild(
          TilingSprite.from(assets.bg, {
            width: viewport.worldWidth,
            height: viewport.worldHeight,
          })
        );

        app.stage.addChild(new Text({ text: "Hello world!" }));

        //const citizen = new Citizen(1, 250, 250);
        //this.entities.add(citizen);

        app.ticker.add(({ deltaTime }) =>
          this.deps.entities.entities.forEach((e) => {
            //console.log(deltaTime);
            e.step(deltaTime, this.deps.inputs);
            e.render(deltaTime, this.deps.inputs, assets);
          })
        );
      }
    );
  }
}
