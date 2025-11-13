import Lobby from "./Lobby";
import Game from "./Game";
import { useEffect, useState } from "preact/hooks";

const App = () => {
  const [gameUrl, setGameUrl] = useState<null | string>(null);
  const [lobbyUrl, setLobbyUrl] = useState<null | string>(null);

  useEffect(() => {
    fetch("/env.json").then((r) => {
      r.json().then((j) => {
        setLobbyUrl(j.lobby_url);
      });
    });
  });

  return lobbyUrl != null ? (
    gameUrl == null ? (
      <Lobby url={lobbyUrl} onPlay={(url) => setGameUrl(url)}></Lobby>
    ) : (
      <Game url={gameUrl}></Game>
    )
  ) : null;
};

export default App;
