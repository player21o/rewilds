import {
  Application,
  Assets,
  AssetsManifest,
  Text,
  TilingSprite,
  TextureStyle,
  Ticker,
} from "pixi.js";
import { ObjectManifest, manifest } from "../assets/manifest";
import { lerp, palette } from "./utils";
import { GameDependencies } from "./game_deps";
import { WS } from "./networking";
import { Viewport } from "pixi-viewport";
import { Stats } from "pixi-stats";
import layers from "./render/layers";
import timer from "./utils/timer";

/**
 * the main class where all magic happens
 */

export class GameManager {
  public deps!: GameDependencies;
  private app: Application;
  private cb: any;
  private ws!: WS;

  private lastX = 0;
  private lastY = 0;
  private txt!: Text;

  public stop() {
    this.deps.stop();
    this.ws.stop();
    Ticker.shared.remove(this.cb);
    this.app.stop();
    layers.stop();
  }

  constructor(app: Application, url: string) {
    const stats = new Stats(app.renderer);
    this.app = app;

    const viewport = new Viewport({
      worldWidth: 1000,
      worldHeight: 1000,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);

    Object.keys(layers)
      .filter((l) => l != "stop")
      .forEach((layer) =>
        viewport.addChild(layers[layer as keyof typeof layers] as any)
      );

    Assets.init({ manifest: manifest as any as AssetsManifest });
    Assets.backgroundLoadBundle(["game"]);

    TextureStyle.defaultOptions.scaleMode = "nearest";

    Assets.loadBundle("game").then(
      (assets: ObjectManifest["bundles"]["game"]) => {
        palette.texture = assets.palette;
        this.deps = new GameDependencies(viewport);
        this.ws = new WS(this.deps, new WebSocket(url));
        this.deps.setMeSendFunction(this.ws.send);
        this.deps.entities.assets = assets;

        assets.palette.source.style.magFilter = "nearest";
        assets.palette.source.style.minFilter = "nearest";
        assets.palette.source.style.mipmapFilter = "nearest";
        assets.palette.source.update();

        const ground = TilingSprite.from(assets.bg, {
          width: viewport.worldWidth,
          height: viewport.worldHeight,
          cullable: false,
        });

        viewport.addChild(ground);
        layers.ground.attach(ground);

        const cb = this.ticker_cb(assets);
        this.cb = cb;

        app.ticker.add(cb);
      }
    );
  }

  private ticker_cb(assets: ObjectManifest["bundles"]["game"]) {
    return (ticker: Ticker) => {
      timer.update(ticker.elapsedMS);
      const deltaTime = ticker.deltaTime;

      this.deps.entities.forEach((e) => {
        if (
          e.x < this.deps.viewport.left ||
          e.x > this.deps.viewport.left + this.app.renderer.width ||
          e.y > this.deps.viewport.top + this.app.renderer.height ||
          e.y < this.deps.viewport.top
        ) {
          e.hide();
          e.culled = true;
          e.culled_step();
        } else {
          e.show();

          e.step(deltaTime, this.deps, ticker);
          e.render(deltaTime, this.deps, assets, ticker);

          if (e.new) {
            e.new = false;
            e.on_first_appearance();
          }

          e.culled = false;
        }
      });

      if (this.deps.me.citizen != null) {
        const t = 1 - Math.pow(1.0 - 0.15, deltaTime);
        this.lastX = lerp(
          this.lastX,
          this.deps.me.citizen.x + this.app.renderer.width / 2,
          t
        );

        this.lastY = lerp(
          this.lastY,
          this.deps.me.citizen.y + this.app.renderer.height / 2,
          t
        );

        this.deps.viewport.moveCenter(this.lastX, this.lastY);
      } else {
        this.deps.viewport.moveCenter(300, 300);
      }
    };
  }
}
