import { useRef } from "react";

interface Props {
  url: string;
  onPlay: (arg0: string) => void;
}

type Packet = ["game_ready", { url: string }];
type SendPacket = ["play"];

const Lobby = ({ url, onPlay }: Props) => {
  const ws = useRef(new WebSocket(url));

  ws.current.onmessage = ({ data }) => {
    const msg = JSON.parse(data) as Packet;

    switch (msg[0]) {
      case "game_ready":
        ws.current.close();
        onPlay(msg[1].url);
        break;
    }
  };
  ws.current.onopen = () => console.log("opened");

  const send = (packet: SendPacket) => ws.current.send(JSON.stringify(packet));

  return (
    <>
      <h1>Lobby</h1>
      <button onClick={() => send(["play"])}>Play</button>
    </>
  );
};

export default Lobby;
