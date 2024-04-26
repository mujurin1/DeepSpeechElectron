import { createClient, DeepgramClient, DeepgramResponse, PrerecordedSchema, SyncPrerecordedResponse } from '@deepgram/sdk';
import { app, BrowserWindow, ipcMain } from 'electron';
import { Buffer } from 'node:buffer';
import Store from "electron-store";

const store = new Store();
const storeKeys = {
  appVersion: "app-version",
  deepgramKey: "deepgram-key",
  deepgramParams: "deepgram-params",
} as const;

export const state = {
  deepgram: null as DeepgramClient,
  store: {
    appVersion: (store.get(storeKeys.appVersion) ?? "1.0") as string,
    deepgramApiKey: (store.get(storeKeys.deepgramKey) ?? "") as string,
    deepgramParams: (store.get(storeKeys.deepgramParams) ?? {
      model: "nova-2",
      language: "ja",
    }) as PrerecordedSchema,
  }
};
export type StoreState = typeof state.store;


app.whenReady().then(() => {
  ipcMain.on("get-store", () => state.store);
  ipcMain.on("create-deepgram-client", handleCreateDeepgramClient);
  ipcMain.on("update-deepgram-params", handleUpdateDeepgramParams);
  ipcMain.on('post-audio', handlePostAudio);
});

function handleCreateDeepgramClient(event: Electron.IpcMainEvent, apiKey: string) {
  store.set(storeKeys.deepgramKey, apiKey);
  state.deepgram = createClient(apiKey);
}

function handleUpdateDeepgramParams(event: Electron.IpcMainEvent, params: PrerecordedSchema) {
  store.set(storeKeys.deepgramParams, params);
  state.store.deepgramParams = params;
}

interface Entry {
  data?: { response: DeepgramResponse<SyncPrerecordedResponse>; event: Electron.IpcMainEvent; };
  error?: unknown;
}
const queue: Entry[] = [];

async function handlePostAudio(event: Electron.IpcMainEvent, buffer: ArrayBuffer) {
  const entry: Entry = {};
  queue.push(entry);

  state.deepgram.listen.prerecorded.transcribeFile(Buffer.from(buffer), state.store.deepgramParams)
    .then(response => {
      entry.data = { response, event };
      flushResolvedEntries();
    })
    .catch(error => {
      entry.error = error ?? "##UNKNOWN ERROR##";
    });
}

function flushResolvedEntries() {
  // eslint-disable-next-line no-constant-condition
  while (queue[0] != null) {
    if (queue[0].data != null) {
      const { response, event } = queue.shift().data;
      const { result, error } = response;

      if (error) console.log("録音: Error:", error);

      const text: string = result?.results?.channels[0]?.alternatives[0]?.transcript;
      console.log("録音: ", text);
      const win = getWindow(event);
      win.webContents.send('deepgram-response', response);
    } else if (queue[0].error != null) {
      const error = queue.shift().error;

      // TODO error send to renderer
      console.log(`Deepgram Response Error: ${error}`);
    } else
      break;
  }
}


function getWindow(event: Electron.IpcMainEvent) {
  return BrowserWindow.fromWebContents(event.sender);
}