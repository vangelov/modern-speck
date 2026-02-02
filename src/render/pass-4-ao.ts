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
import type { Pass1Initial } from "./pass-1-initial";
import type { State } from "../state";
import type { Pass3Accum } from "./pass-3-accum";

export class Pass4AO {
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

    this.colorTexture = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    this.framebuffer = this.pico.createFramebuffer();
    this.framebuffer.colorTarget(0, this.colorTexture);
  }

  run(state: State, pass1Initial: Pass1Initial, pass3Accum: Pass3Accum) {
    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);
    this.pico.drawFramebuffer(this.framebuffer);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.drawCall.texture("uSceneColor", pass1Initial.colorTexture);
    this.drawCall.texture("uSceneDepth", pass1Initial.depthTexture);
    if (pass3Accum.accumTexture)
      this.drawCall.texture("uAccumulatorOut", pass3Accum.accumTexture);
    this.drawCall.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.drawCall.uniform("uAO", 2.0 * state.ao);
    this.drawCall.uniform("uBrightness", 2.0 * state.brightness);
    this.drawCall.uniform("uOutlineStrength", state.outline);

    this.drawCall.draw();
  }
}
