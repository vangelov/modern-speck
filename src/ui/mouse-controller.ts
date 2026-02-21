import type { Renderer } from "../render/renderer";
import { State } from "../state";

type Params = {
  renderContainer: HTMLElement;
  renderer: Renderer;
  state: State;
  onReset: () => void;
};

export function createMouseController({
  renderContainer,
  renderer,
  state,
  onReset,
}: Params) {
  let buttonDown = false;
  let lastX = 0.0;
  let lastY = 0.0;

  renderContainer.addEventListener("mousedown", (e) => {
    document.body.style.cursor = "none";
    if (e.button == 0 || e.button === 2) {
      buttonDown = e.button == 0 || e.button === 2;
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", (e) => {
    document.body.style.cursor = "";
    if (e.button == 0 || e.button === 2) {
      buttonDown = false;
    }
  });

  renderContainer.addEventListener("contextmenu", (e) => e.preventDefault());

  window.addEventListener("mousemove", (e) => {
    if (!buttonDown) {
      return;
    }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    if (dx == 0 && dy == 0) {
      return;
    }

    lastX = e.clientX;
    lastY = e.clientY;

    if (e.shiftKey || e.buttons === 2) {
      State.translate(state, dx, dy, renderer.resolution);
    } else {
      State.rotate(state, dx, dy);
    }

    onReset();
  });

  renderContainer.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const wd = event.deltaY < 0 ? 1 : -1;

      state.zoom = state.zoom * (wd === 1 ? 1 / 0.9 : 0.9);
      State.resolve(state);
      onReset();
    },
    { passive: false },
  );
}
