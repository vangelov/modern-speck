import { Data } from "../data";
import type { Structure } from "../types";

function requestSampleStructure(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("GET", `samples/${file}`, true);
    request.responseType = "text";

    request.onerror = () => {
      reject(new Error("Could not load data"));
    };

    request.onload = () => {
      const { response } = request;

      if (response && Math.trunc(request.status / 100) === 2) {
        resolve(response);
        return;
      }

      reject(new Error("Could not load data"));
    };

    request.send();
  });
}

let cache = new Map<string, Structure>();

async function getSampleStructure(file: string) {
  let structure: Structure | undefined | null = cache.get(file);

  if (!structure) {
    const data = await requestSampleStructure(file);
    structure = Data.Structures.createFromText(data);

    if (structure) cache.set(file, structure);
  }

  return structure;
}

export const Server = {
  getSampleStructure,
};
