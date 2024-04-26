import { DeepgramResponse, PrerecordedSchema, SyncPrerecordedResponse } from "@deepgram/sdk";
import { useEffect, useState } from "react";
import { Trigger } from "./Trigger";

let inited = false;
let _apiKey = "";
let _params: PrerecordedSchema = {
  model: "nova-2",
  language: "ja",
};

const responseAll: DeepgramResponse<SyncPrerecordedResponse>[] = [];
const onChange = new Trigger<[string, PrerecordedSchema]>();
const onDeepgramResponse = new Trigger<[DeepgramResponse<SyncPrerecordedResponse>]>();
onChange.add((apiKey, params) => { _apiKey = apiKey; _params = params; });
window.electronAPI.getSotreData()
  .then(store => onChange.fire(store.deepgramApiKey, store.deepgramParams));
window.electronAPI.onDeepgramResponse(response => onDeepgramResponse.fire(response));

export function useDeepgram() {
  const [responses, setResponses] = useState<DeepgramResponse<SyncPrerecordedResponse>[]>([]);
  const [[apiKey, params], setState] = useState<[string, PrerecordedSchema]>([_apiKey, _params]);

  useEffect(() => {
    const rKey = onDeepgramResponse.add(r => setResponses(oldValue => [...oldValue, r]));
    const cKey = onChange.add((apiKey, params) => setState([apiKey, params]));

    return () => {
      onDeepgramResponse.remove(rKey);
      onChange.remove(cKey);
    };
  }, []);

  return { apiKey, params, responseAll, responses, updateDeepgramSetting };
}

function updateDeepgramSetting(apiKey: string, params: PrerecordedSchema) {
  if (apiKey != null && apiKey != "" && apiKey !== _apiKey) {
    _apiKey = apiKey;
    inited = true;
    window.electronAPI.createDeepgramClient(_apiKey);
  }
  _params = params;
  onChange.fire(_apiKey, _params);
  window.electronAPI.updateDeepgramParams(_params);
}

export function deepgramInit() {
  if (!inited) {
    if (_apiKey == null || _apiKey === "") return false;

    inited = true;
    window.electronAPI.createDeepgramClient(_apiKey);
  }

  return true;
}

export function sendDeepgram(buffer: ArrayBuffer) {
  window.electronAPI.postAudio(buffer);
}
