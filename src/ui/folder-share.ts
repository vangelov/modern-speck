import type { Pane } from "tweakpane";
import type { Renderer } from "../render/renderer";
import { State } from "../state";
import { addInput } from "./inputs";
import * as lz from "lz-string";
import { Config } from "../config";
import { Lib } from "../lib";

type Params = {
  pane: Pane;
  renderer: Renderer;
  state: State;
  canvas: HTMLCanvasElement;
};

export function addShareFolder({ pane, renderer, state, canvas }: Params) {
  const shareFolder = pane.addFolder({ title: "Share", expanded: false });

  if (navigator.clipboard && window.isSecureContext) {
    shareFolder.addButton({ title: "Copy URL" }).on("click", async () => {
      const data = {
        structure: renderer.structure,
        state,
      };

      const hash = lz.compressToEncodedURIComponent(JSON.stringify(data));

      const text = location.href.split("#")[0] + "#" + hash;
      await navigator.clipboard.writeText(text);
    });
  }

  shareFolder.addBlade({ view: "separator" });

  const typesOptions = Config.mimeTypes
    .filter(Lib.supportsMIMEType)
    .map((type) => {
      const slashIndex = type.indexOf("/");
      const name = slashIndex >= 0 ? type.slice(slashIndex + 1) : type;
      return { text: name.toUpperCase(), value: type };
    });

  if (typesOptions.length > 0) {
    const downloadFormatInput = addInput(shareFolder, {
      label: "Download format",
      initialValue: typesOptions[0].value,
      options: typesOptions,
    });

    shareFolder.addButton({ title: "Download" }).on("click", () => {
      const type = downloadFormatInput.getValue();

      renderer.render(state);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "render";
        link.click();

        URL.revokeObjectURL(link.href);
      }, type);
    });
  }
}
