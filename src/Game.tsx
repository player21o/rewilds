import { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import game from "./game/game";

interface Props {
  url: string;
}

const Game = ({ url }: Props) => {
  const div = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    console.log(url);
    const app = new Application();
    //const canvas = document.createElement("canvas") as any as HTMLElement;
    app
      .init({
        antialias: false,
        background: "white",
        roundPixels: false,
        //resolution: 0.5,
        canvas: canvas.current as any,
        //resizeTo: canvas.current as any,
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
      })
      .then(() => {
        ///(div.current as any as HTMLElement).innerHTML = "";
        /////////sd//d/(div.current as any as HTMLElement).appendChild(canvas.current as any);

        game(app);
      });
    return () => {
      app.stop();
    };
  }, []);

  return (
    <div ref={div}>
      <canvas
        ref={canvas}
        style={{ width: "100vw", height: "100vh", imageRendering: "pixelated" }}
      />
    </div>
  );
};

export default Game;
