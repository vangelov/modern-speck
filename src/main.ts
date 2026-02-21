import * as lz from "lz-string";

import { Renderer } from "./render/renderer";
import { State } from "./state";
import { addRenderFolder } from "./ui/folder-render";
import { addStructureFolder } from "./ui/folder-structure";
import { addAboutFolder } from "./ui/folder-about";
import { addHelpFolder } from "./ui/folder-help";
import { createMouseController } from "./ui/mouse-controller";
import { addPane } from "./ui/pane";
import { addShareFolder } from "./ui/folder-share";

import "./style.css";
import type { Structure } from "./types";
import { mat4 } from "gl-matrix";

const canvas = document.getElementById("renderer-canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderContainer = document.getElementById("render-container")!;

let state = State.create();

let initialCustom: Structure | undefined;
const hash = location.hash.slice(1, location.hash.length);

if (hash) {
  try {
    const data = JSON.parse(lz.decompressFromEncodedURIComponent(hash));
    initialCustom = data.structure;
    state = {
      ...data.state,
      rotation: mat4.clone(data.state.rotation),
      windowResolution: state.windowResolution,
    };
  } catch (e) {
    console.error("Could not parse url.");
  }
}

const renderer = await Renderer.create(canvas, state);

//

let needReset = false;
function onReset() {
  needReset = true;
}

const pane = addPane();
addStructureFolder({ pane, renderer, state, initialCustom, onReset });
addRenderFolder({
  pane,
  renderer,
  state,
  onReset,
});
addShareFolder({ pane, renderer, state });
addHelpFolder({ pane });
addAboutFolder({ pane });

createMouseController({
  renderer,
  renderContainer,
  state,
  onReset,
});

window.addEventListener("resize", () => {
  state.windowResolution = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  state.aspect = window.innerWidth / window.innerHeight;
  renderer.setResolution(state);
  needReset = true;
});

function loop() {
  if (needReset) {
    renderer.reset();
    needReset = false;
  }

  renderer.render(state);
  requestAnimationFrame(loop);
}

loop();
