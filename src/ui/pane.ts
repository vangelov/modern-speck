import { Pane } from "tweakpane";
import * as TextareaPlugin from "@pangenerator/tweakpane-textarea-plugin";

export function addPane() {
  const pane = new Pane({
    title: "Controls",
    container: document.getElementById("controls-container")!,
  });

  pane.registerPlugin(TextareaPlugin);

  return pane;
}
