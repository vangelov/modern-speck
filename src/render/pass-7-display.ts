import {
  type DrawCall,
  type Framebuffer,
  PicoGL,
  type Program,
  type Texture,
  type VertexArray,
  type App,
} from "picogl";
import type { Resolution } from "../types";

export class Pass7Display {
  pico: App;
  resolution: Resolution;

  drawCall: DrawCall;
  framebuffer: Framebuffer;

  constructor(
    pico: App,
    screenVertexArray: VertexArray,
    program: Program,
    resolution: Resolution,
  ) {
    this.pico = pico;

    this.drawCall = this.pico.createDrawCall(program, screenVertexArray);
    this.setResolution(resolution);
  }

  setResolution(resolution: Resolution) {
    this.resolution = resolution;
    const { width, height } = resolution;

    const colorTexture = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.framebuffer = this.pico.createFramebuffer();
    this.framebuffer.colorTarget(0, colorTexture);
  }

  run(colorTexture: Texture) {
    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);
    this.pico.defaultDrawFramebuffer();
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.drawCall.texture("uTexture", colorTexture);
    this.drawCall.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.drawCall.draw();
  }
}
