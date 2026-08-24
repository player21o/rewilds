import { Application, Assets } from "pixi.js";
import { GameManager } from "./game/game";
import { onSettled } from "solid-js";

interface Props {
  url: string;
}

const Game = (props: Props) => {
  let container!: HTMLDivElement;

  onSettled(() => {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.imageRendering = "pixelated";
    container.appendChild(canvas);

    const app = new Application();
    let game: GameManager | undefined;
    //app.resize();
    app
      .init({
        antialias: false,
        background: "white",
        roundPixels: false,
        //resolution: 0.5,
        canvas: canvas,
        //resizeTo: canvas.current as any,
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        preference: "webgl",
      })
      .then(() => {
        if (!app.renderer) return;
        game = new GameManager(app, props.url);
      });

    return () => {
      console.log("cleanup");
      game?.stop();
      Assets.unloadBundle("game").then(() => {
        app.destroy(true, {
          children: true,
          texture: true,
          textureSource: true,
          context: true,
        });
      });
    };
  });

  return <div ref={container} />;
};

export default Game;
