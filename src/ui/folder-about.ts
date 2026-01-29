import type { Pane } from "tweakpane";

type Params = {
  pane: Pane;
};

export function addAboutFolder({ pane }: Params) {
  const aboutFolder = pane.addFolder({ title: "About", expanded: false });

  aboutFolder.addBinding(
    {
      message: `
High quality atomistic system rendering.

Speck and the images it produces are completely public domain
and free to use. Do with it/them what you will. Attribution
is appreciated but not required.

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
