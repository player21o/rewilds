import { useState } from "react";
import Lobby from "./Lobby";
import Game from "./Game";

const App = () => {
  const [gameUrl, setGameUrl] = useState<null | string>(null);

  return gameUrl == null ? (
    <Lobby url="ws://localhost:8000" onPlay={(url) => setGameUrl(url)}></Lobby>
  ) : (
    <Game url={gameUrl}></Game>
  );
};

export default App;
