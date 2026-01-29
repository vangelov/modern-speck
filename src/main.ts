import { Renderer } from "./render/renderer";
import { Server } from "./server";
import { State } from "./state";
import { addRenderFolder } from "./ui/folder-render";
import { addStructureFolder } from "./ui/folder-structure";
import { addAboutFolder } from "./ui/folder-about";
import { addHelpFolder } from "./ui/folder-help";
import { createMouseController } from "./ui/mouse-controller";
import { addPane } from "./ui/pane";
import "./style.css";

const structure = await Server.getSampleStructure("testosterone.xyz");

const canvas = document.getElementById("renderer-canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderContainer = document.getElementById("render-container");

if (canvas && structure && renderContainer) {
  const state = State.create();
  const { resolution, aoResolution } = State.getResolutions(
    state,
    window.innerWidth,
    window.innerHeight,
  );
  State.center(state, structure, resolution);

  const renderer = await Renderer.create(canvas, resolution, aoResolution);

  renderer.setStructure(structure, state);

  let needReset = false;

  function onReset() {
    needReset = true;
  }

  const pane = addPane();
  addStructureFolder({ pane });
  addRenderFolder({
    pane,
    structure,
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
    const { resolution, aoResolution } = State.getResolutions(
      state,
      window.innerWidth,
      window.innerHeight,
    );
    renderer.setResolution(resolution, aoResolution);
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
}
