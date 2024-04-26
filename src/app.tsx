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
