import Lobby from "./Lobby";
import Game from "./Game";
import { createSignal, Show, onSettled } from "solid-js";

const App = () => {
  const [gameUrl, setGameUrl] = createSignal<null | string>(null);
  const [lobbyUrl, setLobbyUrl] = createSignal<null | string>(null);

  onSettled(() => {
    fetch("/env.json").then((r) => {
      r.json().then((j) => {
        setLobbyUrl(j.lobby_url);
      });
    });
  });

  return (
    <Show when={lobbyUrl() != null} fallback={null}>
      <Show when={gameUrl() == null} fallback={<Game url={gameUrl()!} />}>
        <Lobby url={lobbyUrl()!} onPlay={(url) => setGameUrl(url)} />
      </Show>
    </Show>
  );
};

export default App;
