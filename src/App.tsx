import Lobby from "./Lobby";
import Game from "./Game";
import { useState } from "preact/hooks";

const App = () => {
  const [gameUrl, setGameUrl] = useState<null | string>(null);

  return gameUrl == null ? (
    <Lobby url="ws://localhost:8888" onPlay={(url) => setGameUrl(url)}></Lobby>
  ) : (
    <Game url={gameUrl}></Game>
  );
};

export default App;
