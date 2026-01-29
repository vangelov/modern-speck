import type { Pane } from "tweakpane";

type Params = {
  pane: Pane;
};

export function addHelpFolder({ pane }: Params) {
  const helpFolder = pane.addFolder({ title: "Help", expanded: false });
  helpFolder.addBinding(
    {
      message: `
Speck has been tested against recent Firefox
and Chrome browsers. Performance appears to be
significantly better on Chrome.

To translate your system, use the shift key
and click and drag on the rendering.
To rotate, click and drag.
To zoom, use the scrollwheel.
`.trim(),
    },
    "message",
    {
      readonly: true,
      multiline: true,

      rows: 9,
      label: undefined, // this hides the label element
      interval: 0, // this prevents (or should at least) from monitor binding updates
    },
  );
}
