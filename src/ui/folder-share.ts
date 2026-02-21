import type { Pane } from "tweakpane";
import type { Renderer } from "../render/renderer";
import { State } from "../state";
import { addInput } from "./inputs";
import * as lz from "lz-string";

type Params = {
  pane: Pane;
  renderer: Renderer;
  state: State;
};

export function addShareFolder({ pane, renderer, state }: Params) {
  const shareFolder = pane.addFolder({ title: "Share" });

  if (navigator.clipboard && window.isSecureContext) {
    shareFolder.addButton({ title: "Copy URL" }).on("click", async () => {
      const data = {
        structure: renderer.structure,
        state,
      };

      const hash = lz.compressToEncodedURIComponent(JSON.stringify(data));
      console.log("fuck", JSON.stringify(data));

      const text = location.href.split("#")[0] + "#" + hash;
      await navigator.clipboard.writeText(text);
    });
  }

  shareFolder.addBlade({ view: "separator" });

  const downloadFormatInput = addInput(shareFolder, {
    label: "Download format",
    initialValue: "png",
    options: [{ text: "PNG", value: "png" }],
    onChange: (value) => {},
  });

  shareFolder.addButton({ title: "Download" }).on("click", () => {
    console.log("v", downloadFormatInput.getValue());
  });
}
