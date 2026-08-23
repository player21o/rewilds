import { Application } from "pixi.js";
import { GameManager } from "./game/game";
import { onSettled } from "solid-js";

interface Props {
  url: string;
}

const Game = ({ url }: Props) => {
  let div!: HTMLDivElement;
  let canvas!: HTMLCanvasElement;

  onSettled(() => {
    const app = new Application();
    let game!: GameManager;
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
        game = new GameManager(app, url);
      });

    return () => {
      game.stop();
    };
  });

  return (
    <div ref={div}>
      <canvas
        ref={canvas}
        style={{
          width: "100vw",
          height: "100vh",
          "image-rendering": "pixelated",
          //scale: 2,
        }}
      />
    </div>
  );
};

export default Game;
