import React, { useState } from 'react';
import { useVadAudio } from './VadAudio';
import { useYukakone } from './Yukakone';
import { useDeepgram } from './Deepgram';
import { ConnectState } from './type';

import "./renderer.css";

export function Main() {
  const [port, setPort] = useState(50000);

  const vadState = useVadAudio();
  const deepgramState = useDeepgram();
  const yukakoneState = useYukakone();

  const [apiKey, setApiKey] = useState(deepgramState.apiKey);
  const [deepgramParams, setDeepgramParams] = useState(deepgramState.params);

  return (
    <div>
      <Box title="DeepSpeechElectron v0.2">
        <div>
          <div style={{ display: "flex", marginBottom: 10 }} >
            <button
              style={{ marginLeft: 30, color: "green", fontWeight: "bold" }}
              onClick={() => {
                if (vadState.sendDeepgram === "disconnect" || vadState.sendDeepgram === "reject")
                  vadState.changeSendDeepgram(true);
                if (vadState.running === "disconnect" || vadState.running === "reject")
                  vadState.resetVadAudio();
                if (yukakoneState.connected === "disconnect" || yukakoneState.connected === "reject")
                  yukakoneState.connect(port);
              }} >全て接続する</button>
          </div>
          <Connection name={"Deepgram"} connect={vadState.sendDeepgram}
            on={() => vadState.changeSendDeepgram(true)}
            off={() => vadState.changeSendDeepgram(false)}
            errorMessage="API KEY を入力してください"
          >
          </Connection>
          <Connection name={"マイク"} connect={vadState.running}
            on={vadState.resetVadAudio}
            off={vadState.destroyVadAudio}
          />
          <Connection name={"ゆかコネ"} connect={yukakoneState.connected}
            on={() => yukakoneState.connect(port)}
            off={yukakoneState.disconnect}
          >
            Port:<input type="number" value={port} onChange={e => setPort(+e.target.value)} style={{ width: 70 }} />
          </Connection>
        </div>

        <div className={vadState.speeking ? "onSound" : ""}>onSound:</div>
      </Box>

      <Box title="ゆかコネ">
        なし
      </Box>
      {/* API KEY を入力してください */}
      <Box title="Deepgram">
        <div>
          <button disabled={apiKey === ""} onClick={() => deepgramState.updateDeepgramSetting(apiKey, deepgramParams)}>
            設定を更新する (これを押すまでは更新されません)
          </button>
          {apiKey === "" ? "API KEY を入力してください" : ""}
        </div>
        <div>
          API Key:
          <input type="password" size={10} value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <button onClick={async () => setApiKey(await navigator.clipboard.readText())}>クリップボードから貼り付け</button>
        </div>
        <div>
          モデル (変更不可. 後で対応します):
          <input type="text" readOnly value={deepgramParams.model} onChange={e => setDeepgramParams(oldValue => ({ ...oldValue, model: e.target.value }))} />
        </div>
        <div>
          言語 (変更不可. 後で対応します):
          <input type="text" readOnly value={deepgramParams.language} onChange={e => setDeepgramParams(oldValue => ({ ...oldValue, language: e.target.value }))} />
        </div>
      </Box>

      <div>
        認識結果 {deepgramState.responses.length}
        <div>
          {
            deepgramState.responses.reverse().map((response, i) => {
              if (response.error != null) {
                return (
                  <details key={i}>
                    <summary className="error">エラー (API KEY が古い可能性があります)</summary>
                    {response.error.message}
                  </details>
                );
              }

              let text: string = response.result.results.channels[0].alternatives[0].transcript;
              if (text === "") text = "[#無し] (「あー」や「うー」のみの発音をDeepgramは文字起こししません）";
              return (
                <details key={i} style={{ whiteSpace: "pre-wrap" }}>
                  <summary>{text}</summary>
                  <details style={{ marginLeft: 20 }}>
                    <summary>メタデータ</summary>
                    {JSON.stringify(response.result.metadata, null, 2)}
                  </details>
                  <details style={{ marginLeft: 20 }}>
                    <summary>レスポンス</summary>
                    {JSON.stringify(response.result.results.channels[0].alternatives[0], null, 2)}
                  </details>
                </details>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

interface BoxParam {
  title: string;
  children: React.ReactNode;
}

function Box({ title, children }: BoxParam) {
  return (
    <div className="box">
      <h3><span>{title}</span></h3>
      <div className="inner">
        {children}
      </div>
    </div>
  );
}

interface ConnectionParam {
  name: string;
  connect: ConnectState;
  errorMessage?: string;
  children?: React.ReactNode;

  on: () => void;
  off: () => void;
}
function Connection({ name, connect, errorMessage, children, on, off }: ConnectionParam) {
  const click = connect === "connected" ? off : on;
  const disable = connect === "connecting";

  return (
    <div style={{ display: "flex" }} >
      <div style={{ width: 100 }}>{name}</div>
      <button style={{ width: 85, marginRight: 10 }} className={connect} disabled={disable} onClick={click} />
      {connect === "reject" ? errorMessage : ""}
      {children}
    </div>
  );
}
