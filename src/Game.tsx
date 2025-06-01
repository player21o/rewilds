import { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import { GameManager } from "./game/game";

interface Props {
  url: string;
}

const Game = ({ url }: Props) => {
  const div = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    const app = new Application();
    let game!: GameManager;
    //app.resize();
    socket.onopen = () => {
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
          game = new GameManager(app, url);
        });
    };

    return () => {
      game.stop();
      socket.close();
    };
  }, []);

  return (
    <div ref={div}>
      <canvas
        ref={canvas}
        style={{
          width: "100vw",
          height: "100vh",
          imageRendering: "pixelated",
          //scale: 2,
        }}
      />
    </div>
  );
};

export default Game;
