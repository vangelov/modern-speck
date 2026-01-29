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

  renderContainer.addEventListener("mousedown", function (e) {
    document.body.style.cursor = "none";
    if (e.button == 0) {
      buttonDown = true;
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", function (e) {
    document.body.style.cursor = "";
    if (e.button == 0) {
      buttonDown = false;
    }
  });

  window.addEventListener("mousemove", function (e) {
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

    if (e.shiftKey) {
      State.translate(state, dx, dy, renderer.resolution);
    } else {
      State.rotate(state, dx, dy);
    }

    onReset();
  });

  renderContainer.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();
      const wd = event.deltaY < 0 ? 1 : -1;

      state.zoom = state.zoom * (wd === 1 ? 1 / 0.9 : 0.9);
      State.resolve(state);
      onReset();
    },
    { passive: false },
  );
}
