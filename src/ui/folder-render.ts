import type { Pane } from "tweakpane";
import { addInput, addPercentInput } from "./inputs";
import { State } from "../state";
import type { Resolution, Structure } from "../types";
import type { Renderer } from "../render/renderer";

export type Params = {
  pane: Pane;
  state: State;
  structure: Structure;
  renderer: Renderer;
  onReset: () => void;
};

export function addRenderFolder({
  pane,
  state,
  renderer,
  structure,
  onReset,
}: Params) {
  const renderFolder = pane.addFolder({ title: "Render" });

  addPercentInput(renderFolder, {
    label: "Atom radius",
    hotKey: "a",
    initialValue: state.atomScale,
    onChange: (value) => {
      state.atomScale = value;
      onReset();
    },
  });

  addPercentInput(renderFolder, {
    label: "Relative atom radius",
    hotKey: "z",
    initialValue: state.relativeAtomScale,
    onChange: (value) => {
      state.relativeAtomScale = value;
      onReset();
    },
  });

  addPercentInput(renderFolder, {
    label: "Atom shade",
    hotKey: "w",
    initialValue: state.atomShade,
    onChange: (value) => {
      state.atomShade = value;
      onReset();
    },
  });

  renderFolder.addBlade({ view: "separator" });

  addInput(renderFolder, {
    label: "Bonds",
    initialValue: false,
    onChange: (value) => {
      state.bonds = value;
      renderer.setStructure(structure, state);
      onReset();
    },
  });

  addPercentInput(renderFolder, {
    label: "Bond radius",
    hotKey: "b",
    initialValue: state.bondScale,
    onChange: (value) => {
      state.bondScale = value;
      onReset();
    },
  });

  addInput(renderFolder, {
    label: "Bond threshold",
    initialValue: state.bondThreshold,
    min: 0,
    max: 2.5,
    step: 0.1,
    onChange: (value) => {
      state.bondThreshold = value;
      renderer.setStructure(structure, state);
      onReset();
    },
  });

  addPercentInput(renderFolder, {
    label: "Bond shade",
    hotKey: "s",
    initialValue: state.bondShade,
    onChange: (value) => {
      state.bondShade = value;
      onReset();
    },
  });

  renderFolder.addBlade({ view: "separator" });

  addPercentInput(renderFolder, {
    label: "Ambient occlusion",
    hotKey: "a",
    initialValue: state.ao,
    onChange: (value) => {
      state.ao = value;
    },
  });

  addPercentInput(renderFolder, {
    label: "Brightness",
    hotKey: "l",
    initialValue: state.brightness,
    onChange: (value) => {
      state.brightness = value;
    },
  });

  addInput(renderFolder, {
    label: "AO resolution scale",
    initialValue: 1,
    options: [
      { text: "x1/8", value: 1 / 8 },
      { text: "x1/4", value: 1 / 4 },
      { text: "x1/2", value: 1 / 4 },
      { text: "No scale", value: 1 },
      { text: "x2", value: 2 },
      { text: "x4", value: 4 },
      { text: "x8", value: 8 },
    ],
    onChange: (value) => {
      state.aoResScale = value;

      const { resolution, aoResolution } = State.getResolutions(
        state,
        window.innerWidth,
        window.innerHeight,
      );

      renderer.setResolution(resolution, aoResolution);
      onReset();
    },
  });

  addInput(renderFolder, {
    label: "Samples per frame",
    initialValue: 32,
    options: [
      { text: "0", value: 0 },
      { text: "1", value: 1 },
      { text: "2", value: 2 },
      { text: "4", value: 4 },
      { text: "8", value: 8 },
      { text: "16", value: 16 },
      { text: "32", value: 32 },
      { text: "64", value: 64 },
      { text: "128", value: 128 },
      { text: "256", value: 256 },
    ],
    onChange: (value) => {
      state.spf = value;
    },
  });

  renderFolder.addBlade({ view: "separator" });

  addPercentInput(renderFolder, {
    label: "Depth of field strength",
    hotKey: "d",
    initialValue: state.dofStrength,
    onChange: (value) => {
      state.dofStrength = value;
    },
  });

  addPercentInput(renderFolder, {
    label: "Depth of field position",
    hotKey: "p",
    initialValue: state.dofPosition,
    onChange: (value) => {
      state.dofPosition = value;
    },
  });

  renderFolder.addBlade({ view: "separator" });

  addPercentInput(renderFolder, {
    label: "Outline strength",
    hotKey: "q",
    initialValue: state.outline,
    onChange: (value) => {
      state.outline = value;
    },
  });

  addInput(renderFolder, {
    label: "Antialiasing passes",
    initialValue: state.fxaa,
    min: 0,
    max: 32,
    step: 1,
    onChange: (value) => {
      state.fxaa = value;
    },
  });

  addInput(renderFolder, {
    label: "Resolution scale",
    initialValue: 1,
    options: [
      { text: "x1/8", value: 1 / 8 },
      { text: "x1/4", value: 1 / 4 },
      { text: "x1/2", value: 1 / 4 },
      { text: "No scale", value: 1 },
      { text: "x2", value: 2 },
      { text: "x4", value: 4 },
      { text: "x8", value: 8 },
    ],
    onChange: (value) => {
      state.resolutionScale = value;

      const { resolution, aoResolution } = State.getResolutions(
        state,
        window.innerWidth,
        window.innerHeight,
      );

      renderer.setResolution(resolution, aoResolution);
      onReset();
    },
  });

  renderFolder.addBlade({ view: "separator" });

  renderFolder.addButton({ title: "Center" }).on("click", () => {
    State.center(state, structure, renderer.resolution);
    onReset();
  });
}
