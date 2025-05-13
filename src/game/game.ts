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
import { WS } from "./networking";
import { palette } from "./utils";

export class GameManager {
  public entities: EntitiesManager;
  public ws: WS;
  public inputs: InputsManager;

  constructor(app: Application, socket: WebSocket) {
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);

    Assets.init({ manifest: manifest as any as AssetsManifest });
    Assets.backgroundLoadBundle(["game"]);

    TextureStyle.defaultOptions.scaleMode = "nearest";

    this.ws = new WS(this, socket);
    this.entities = new EntitiesManager(viewport);
    this.inputs = new InputsManager(viewport);

    Assets.loadBundle("game").then(
      (assets: ObjectManifest["bundles"]["game"]) => {
        palette.texture = assets.palette;

        assets.palette.source.style.magFilter = "nearest";
        assets.palette.source.style.minFilter = "nearest";
        assets.palette.source.style.mipmapFilter = "nearest";
        assets.palette.source.update();

        this.entities = new EntitiesManager(viewport, assets);
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
          this.entities.entities.forEach((e) => {
            //console.log(deltaTime);
            e.step(deltaTime, this.inputs);
            e.render(deltaTime, this.inputs, assets);
          })
        );
      }
    );
  }
}
