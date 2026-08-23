import { createSignal, onSettled } from "solid-js";

interface Props {
  url: string;
  onPlay: (arg0: string) => void;
}

type Packet = ["game_ready", { url: string }];
type SendPacket = ["play"];

const Lobby = (props: Props) => {
  let ws: WebSocket | null = null;
  const [isOpen, setIsOpen] = createSignal(false);

  onSettled(() => {
    const socket = new WebSocket(props.url);
    ws = socket;

    socket.onopen = () => {
      console.log("opened");
      setIsOpen(true);
    };

    socket.onclose = () => {
      setIsOpen(false);
    };

    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data) as Packet;
      switch (msg[0]) {
        case "game_ready":
          socket.close();
          props.onPlay(msg[1].url);
          break;
      }
    };

    // Return cleanup callback for disposal on unmount
    return () => {
      socket.close();
    };
  });

  const send = (packet: SendPacket) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(packet));
    }
  };

  return (
    <>
      <h1>Lobby</h1>
      <button disabled={!isOpen()} onClick={() => send(["play"])}>
        Play
      </button>
    </>
  );
};

export default Lobby;
