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
import type { State } from "../state";
import type { Pass1Initial } from "./pass-1-initial";

export class Pass6DOF {
  pico: App;
  resolution: Resolution;

  drawCall: DrawCall;
  framebuffer: Framebuffer;

  colorTexture: Texture;

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

    this.colorTexture = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.framebuffer = this.pico.createFramebuffer();
    this.framebuffer.colorTarget(0, this.colorTexture);
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
