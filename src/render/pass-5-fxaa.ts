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
import type { Pass4AO } from "./pass-4-ao";

export class Pass5FXAA {
  pico: App;
  resolution: Resolution;
  drawCall: DrawCall;
  framebufferA: Framebuffer;
  framebufferB: Framebuffer;

  colorTexture: Texture | null;

  constructor(
    pico: App,
    screenVertexArray: VertexArray,
    program: Program,
    resolution: Resolution,
  ) {
    this.pico = pico;
    this.colorTexture = null;

    this.drawCall = this.pico.createDrawCall(program, screenVertexArray);
    this.setResolution(resolution);
  }

  setResolution(resolution: Resolution) {
    this.resolution = resolution;
    const { width, height } = resolution;

    const colorTextureA = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    const colorTextureB = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.framebufferA = this.pico.createFramebuffer();
    this.framebufferA.colorTarget(0, colorTextureA);

    this.framebufferB = this.pico.createFramebuffer();
    this.framebufferB.colorTarget(0, colorTextureB);
  }

  run(state: State, pass4AO: Pass4AO) {
    let lastT = pass4AO.colorTexture;
    let cT = lastT;

    for (let i = 0; i < state.fxaa; i++) {
      const f =
        cT === lastT
          ? this.framebufferA
          : cT === this.framebufferB.colorAttachments[0]
            ? this.framebufferA
            : this.framebufferB;
      this.pico.drawFramebuffer(f);

      this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
      this.pico.clear();

      this.drawCall.texture("uTexture", cT);

      this.drawCall.uniform("uRes", [
        this.resolution.width,
        this.resolution.height,
      ]);
      this.drawCall.draw();

      cT =
        cT === lastT
          ? this.framebufferA.colorAttachments[0]
          : cT === this.framebufferA.colorAttachments[0]
            ? this.framebufferB.colorAttachments[0]
            : this.framebufferA.colorAttachments[0];
    }

    this.colorTexture = cT;
  }
}
