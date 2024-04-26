import { MicVAD, utils } from "@ricky0123/vad-web";
import { useState, useEffect } from "react";
import { Trigger } from "./Trigger";
import { deepgramInit, sendDeepgram } from "./Deepgram";
import { ConnectState } from "./type";


let stream: MediaStream;
let vad: MicVAD;
// let destroy: () => void;
let _sendDeepgram: ConnectState = "disconnect";
let _vadConnect: ConnectState = "disconnect";
let _speeking = false;
const onSendDeepgramChange = new Trigger<[ConnectState]>();
const onVadConnectChange = new Trigger<[ConnectState]>();
const onSpeechingChange = new Trigger<[boolean]>();
onSendDeepgramChange.add(s => _sendDeepgram = s);
onVadConnectChange.add(r => _vadConnect = r);
onSpeechingChange.add(s => _speeking = s);

export function useVadAudio() {
  const [running, setRunning] = useState(_vadConnect);
  const [speeking, setSpeeking] = useState(_speeking);
  const [sendDeepgram, setSendDeepgram] = useState(_sendDeepgram);

  useEffect(() => {
    const dKey = onSendDeepgramChange.add(setSendDeepgram);
    const rKey = onVadConnectChange.add(setRunning);
    const sKey = onSpeechingChange.add(setSpeeking);

    return () => {
      onSendDeepgramChange.remove(dKey);
      onVadConnectChange.remove(rKey);
      onSpeechingChange.remove(sKey);
    };
  }, []);

  return { running, speeking, sendDeepgram, changeSendDeepgram, resetVadAudio, destroyVadAudio };
}

function changeSendDeepgram(send: boolean) {
  if (
    _sendDeepgram === "connecting" ||
    send && _sendDeepgram === "connected" ||
    !send && _sendDeepgram !== "connected"
  ) return;

  if (send) {
    if (deepgramInit())
      onSendDeepgramChange.fire("connected");
    else
      onSendDeepgramChange.fire("reject");
  } else onSendDeepgramChange.fire("disconnect");
}

function destroyVadAudio() {
  stream?.getTracks()?.forEach(track => track.stop());
  vad?.destroy();
  stream = null;
  vad = null;
  onSpeechingChange.fire(false);
  onVadConnectChange.fire("disconnect");
}

async function resetVadAudio() {
  destroyVadAudio();
  onVadConnectChange.fire("connecting");

  const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
  const vadPromise = streamPromise.then(async stream => [
    stream,
    await MicVAD.new({
      stream,
      // 喋り始めのnフレーム前を含める（onSpeechEnd に渡されるデータ）
      preSpeechPadFrames: 5,
      // minSpeechFrames: 5,  // 喋っている時間がこれより短い場合は onSpeechEnd を呼ばない
      // onSpeechEnd が呼ばれない時に代わりに呼ばれる (喋っている時間が minSpeechFrames より小さいとき）
      onVADMisfire: () => {
        onSpeechingChange.fire(false);
      },
      onSpeechStart: () => {
        onSpeechingChange.fire(true);
      },
      onSpeechEnd: (data) => {
        onSpeechingChange.fire(false);
        const buffer = utils.encodeWAV(data);
        if (_sendDeepgram === "connected") sendDeepgram(buffer);
      },
    })
  ] as const);

  streamPromise.catch(() => onVadConnectChange.fire("reject"));
  vadPromise.catch(() => onVadConnectChange.fire("reject"));
  vadPromise
    .then(([newStream, newVad]) => {
      stream = newStream;
      vad = newVad;
      vad.start();
      onVadConnectChange.fire("connected");
    });
}
