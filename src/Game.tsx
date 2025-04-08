import { Application } from "pixi.js";
import { useEffect, useRef } from "react";

const Game = () => {
  const div = useRef(null);

  useEffect(() => {
    const app = new Application();
    app
      .init({ resizeTo: window, antialias: false, background: "red" })
      .then(() => (div.current as any as HTMLElement).appendChild(app.canvas));
  });

  return <div ref={div}></div>;
};

export default Game;
