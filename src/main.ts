import { Renderer } from "./render/renderer";
import { State } from "./state";
import { addRenderFolder } from "./ui/folder-render";
import { addStructureFolder } from "./ui/folder-structure";
import { addAboutFolder } from "./ui/folder-about";
import { addHelpFolder } from "./ui/folder-help";
import { createMouseController } from "./ui/mouse-controller";
import { addPane } from "./ui/pane";
import "./style.css";

const canvas = document.getElementById("renderer-canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderContainer = document.getElementById("render-container")!;

const state = State.create();
const renderer = await Renderer.create(canvas, state);

let needReset = false;
function onReset() {
  needReset = true;
}

const pane = addPane();
addStructureFolder({ pane, renderer, state, onReset });
addRenderFolder({
  pane,
  renderer,
  state,
  onReset,
});
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
