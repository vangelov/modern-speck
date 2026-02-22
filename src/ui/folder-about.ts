import type { Pane } from "tweakpane";

type Params = {
  pane: Pane;
};

export function addAboutFolder({ pane }: Params) {
  const aboutFolder = pane.addFolder({ title: "About", expanded: false });

  const message = `
This project is a modernized reimplementation of the
original Speck molecule renderer created by Rye Terrell.

Original project: https://github.com/wwwtyro/speck

Notable changes:
- Full-viewport rendering
- Combined color and normal outputs in a single draw call using MRT
- Instanced rendering for atoms and bonds
- Ping-pong rendering for AO and FXAA instead of texture copying
- Structured the renderer around modular rendering passes
- Rewritten in TypeScript, built with Vite (https://vite.dev/)
- Upgraded to WebGL 2 using PicoGL.js (https://tsherif.github.io/picogl.js/)
- New UI built with Tweakpane (https://tweakpane.github.io/docs/)
`.trim();

  const lines = message.split("\n").length;

  aboutFolder.addBinding(
    {
      message,
    },
    "message",
    {
      readonly: true,
      multiline: true,
      rows: lines + 1,
      label: undefined,
      interval: 0,
    },
  );
}
