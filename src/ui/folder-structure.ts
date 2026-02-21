import type { Pane } from "tweakpane";
import { addInput } from "./inputs";
import type { Renderer } from "../render/renderer";
import { Config } from "../config";
import { Server } from "../server";
import { State } from "../state";
import { Data } from "../data";

type Params = {
  pane: Pane;
  renderer: Renderer;
  state: State;
  onReset: () => void;
};

export function addStructureFolder({ pane, renderer, state, onReset }: Params) {
  const structureFolder = pane.addFolder({ title: "Structure" });

  async function loadAndDisplay(custom?: string) {
    const structure = custom
      ? Data.Structures.createFromText(custom)
      : await Server.getSampleStructure(state.file);

    if (!structure) return;

    State.center(state, structure);
    renderer.setStructure(structure, state);
  }

  loadAndDisplay();

  addInput(structureFolder, {
    label: "Sample",
    initialValue: state.file,
    options: Config.samples.map((sample) => ({
      text: sample.name,
      value: sample.file,
    })),
    onChange: async (value) => {
      state.file = value;
      await loadAndDisplay();
      onReset();
    },
  });

  structureFolder.addBlade({ view: "separator" });

  const customInput = addInput(structureFolder, {
    view: "textarea",
    label: "Custom",
    rows: 3,
    initialValue: "",
    placeholder: "Paste xyz file data...",
  });

  structureFolder
    .addButton({
      title: "Load",
    })
    .on("click", () => {
      loadAndDisplay(customInput.getValue());
      onReset();
    });
}
