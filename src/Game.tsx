import { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import game from "./game/game";

interface Props {
  url: string;
}

const Game = ({ url }: Props) => {
  const div = useRef(null);

  useEffect(() => {
    const app = new Application();
    app
      .init({ resizeTo: window, antialias: false, background: "white" })
      .then(() => {
        (div.current as any as HTMLElement).appendChild(app.canvas);
        game(app);
      });
  });

  return <div ref={div}></div>;
};

export default Game;
