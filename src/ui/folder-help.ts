import type { Pane } from "tweakpane";

type Params = {
  pane: Pane;
};

export function addHelpFolder({ pane }: Params) {
  const helpFolder = pane.addFolder({ title: "Help", expanded: false });
  helpFolder.addBinding(
    {
      message: `
- To translate your system, use the shift key or mouse
right key and click and drag on the rendering.
- To rotate, click and drag.
- To zoom, use the scrollwheel.
`.trim(),
    },
    "message",
    {
      readonly: true,
      multiline: true,
      rows: 4,
      label: undefined,
      interval: 0,
    },
  );
}
