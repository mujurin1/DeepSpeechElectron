// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { DeepgramResponse, PrerecordedSchema, SyncPrerecordedResponse } from "@deepgram/sdk";
import { contextBridge, ipcRenderer } from "electron";
import type { StoreState } from "./main/main";

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

const electronAPI = {
  getSotreData: () => ipcRenderer.invoke('get-store') as Promise<StoreState>,

  createDeepgramClient: (apiKey: string) => ipcRenderer.send('create-deepgram-client', apiKey),
  updateDeepgramParams: (params: PrerecordedSchema) => ipcRenderer.send('update-deepgram-params', params),
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  postAudio: (buffer: ArrayBuffer) => ipcRenderer.send("post-audio", buffer),

  onDeepgramResponse: (handler: (response: DeepgramResponse<SyncPrerecordedResponse>) => void): () => void => {
    const fn: Parameters<typeof ipcRenderer.on>[1] = (event, data) => handler(data);
    ipcRenderer.on('deepgram-response', fn);
    return () => ipcRenderer.off('deepgram-result', fn);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
