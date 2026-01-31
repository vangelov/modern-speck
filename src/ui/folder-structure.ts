import type { Pane } from "tweakpane";
import { addInput } from "./inputs";
import type { Renderer } from "../render/renderer";
import { samples } from "../config/samples";
import { Server } from "../server";
import { State } from "../state";

type Params = {
  pane: Pane;
  renderer: Renderer;
  state: State;
  onReset: () => void;
};

export function addStructureFolder({ pane, renderer, state, onReset }: Params) {
  const structureFolder = pane.addFolder({ title: "Structure" });

  async function display() {
    const structure = await Server.getSampleStructure(state.file);
    if (!structure) return;
    State.center(state, structure);
    renderer.setStructure(structure, state);
  }

  display();

  addInput(structureFolder, {
    label: "Sample",
    initialValue: state.file,
    options: samples.map((sample) => ({
      text: sample.name,
      value: sample.file,
    })),
    onChange: async (value) => {
      state.file = value;
      await display();
      onReset();
    },
  });

  structureFolder.addBlade({ view: "separator" });

  addInput(structureFolder, {
    view: "textarea",
    label: "Custom",
    rows: 3,
    initialValue: "",
    placeholder: "Paste xyz file data...",
    onChange: (value) => {},
  });

  structureFolder.addButton({
    title: "Load",
  });
}
