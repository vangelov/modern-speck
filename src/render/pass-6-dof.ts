import {
  DrawCall,
  Framebuffer,
  PicoGL,
  Program,
  Texture,
  VertexArray,
  type App,
} from "picogl";
import type { Resolution } from "../types";
import type { State } from "../state";
import type { Pass1Initial } from "./pass-1-initial";

export class Pass6FXAA {
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

    const colorTarget = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.framebuffer = this.pico.createFramebuffer();
    this.framebuffer.colorTarget(0, colorTarget);
  }

  run(state: State, pass1Initial: Pass1Initial, colorTexture: Texture) {
    this.pico.drawFramebuffer(this.framebuffer);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.drawCall.texture("uColor", colorTexture);
    this.drawCall.texture("uDepth", pass1Initial.depthTexture);
    this.drawCall.uniform("uDOFPosition", state.dofPosition);
    this.drawCall.uniform("uDOFStrength", state.dofStrength);
    this.drawCall.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.drawCall.draw();
  }
}
