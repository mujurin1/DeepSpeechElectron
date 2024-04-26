import { useEffect, useState } from "react";
import { Trigger } from "./Trigger";
import { ConnectState } from "./type";

let ws: WebSocket;
let _connected: ConnectState = "disconnect";
const onChangeConnect = new Trigger<[ConnectState]>();
onChangeConnect.add(c => _connected = c);

export function useYukakone() {
  const [connected, setConnected] = useState(_connected);

  useEffect(() => {
    const cKey = onChangeConnect.add(setConnected);

    return () => {
      onChangeConnect.remove(cKey);
    };
  }, []);

  return { connected, connect, disconnect, send };
}

function connect(port: number) {
  if (ws != null && ws.readyState === WebSocket.OPEN)
    ws.close();
  onChangeConnect.fire("connecting");

  ws = new WebSocket(`ws://localhost:${port}`);
  ws.onopen = (() => onChangeConnect.fire("connected"));
  ws.close = (() => onChangeConnect.fire("disconnect"));
  ws.onerror = (() => onChangeConnect.fire("reject"));
}

function disconnect() {
  if (ws == null || ws.readyState !== WebSocket.OPEN) return;
  ws.close();
}

function send(text: string) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(text);
}
