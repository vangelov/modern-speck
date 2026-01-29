import type { Pane } from "tweakpane";
import { addInput } from "./inputs";

type Params = {
  pane: Pane;
};

export function addStructureFolder({ pane }: Params) {
  const structureFolder = pane.addFolder({ title: "Structure" });

  addInput(structureFolder, {
    label: "Sample",
    initialValue: 1,
    onChange: () => {},
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
