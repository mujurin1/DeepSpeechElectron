import { LiveClient, LiveConnectionState, LiveTranscriptionEvents, createClient } from '@deepgram/sdk';
import { MicVAD, utils } from '@ricky0123/vad-web';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Main } from './renderer/renderer';

createRoot(document.getElementById("root")!)
  .render(
    <React.StrictMode>
      {/* <App /> */}
      <Main />
    </React.StrictMode>,
  );


//#region API KEY
//#region API KEY
//#region API KEY
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const API_KEY: string = "9eaa46d6668d0fef00e48a7d9e07eb8bbfaaeaec";
//#endregion API KEY
//#endregion API KEY
//#endregion API KEY

function deepgramRealtime() {
  const deepgram = createClient(API_KEY);
  const connection = deepgram.listen.live({
    model: "nova-2",
    language: "ja",
    // endpointing: 10,
    // smart_format: true,
  });

  let resolve: (_: LiveClient) => void;
  const waitConnect = new Promise<LiveClient>(_resolve => resolve = _resolve);

  connection.on(LiveTranscriptionEvents.Open, async () => {
    connection.on(LiveTranscriptionEvents.Close, (data) => {
      console.log("Connection closed.");
      console.log(data);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const text: string = data.channel.alternatives[0].transcript;
      if (text === "") return;
      console.log("リアルタイム: ", text);
    });

    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.log("リアルタイム: Metadata", data);
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.log("リアルタイム: Error", err);
    });

    resolve(connection);
  });

  return waitConnect;
}
