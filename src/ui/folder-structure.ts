import type { Pane } from "tweakpane";

import { addInput } from "./inputs";
import type { Renderer } from "../render/renderer";
import { Config } from "../config";
import { Server } from "../server";
import { State } from "../state";
import { Data } from "../data";
import type { Structure } from "../types";

type Params = {
  pane: Pane;
  renderer: Renderer;
  state: State;
  initialCustom?: Structure;
  onReset: () => void;
};

export function addStructureFolder({
  pane,
  renderer,
  state,
  initialCustom,
  onReset,
}: Params) {
  const structureFolder = pane.addFolder({ title: "Structure" });

  async function loadAndDisplay(structure?: Structure | null) {
    structure = structure || (await Server.getSampleStructure(state.file));
    if (!structure) return;

    if (!initialCustom) State.center(state, structure);
    renderer.setStructure(structure, state);
  }

  loadAndDisplay(initialCustom);

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
      const structure = Data.Structures.createFromText(customInput.getValue());
      if (!structure) return;

      loadAndDisplay(structure);
      onReset();
    });
}
