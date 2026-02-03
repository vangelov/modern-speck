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

export class Pass5FXAA {
  pico: App;
  resolution: Resolution;
  drawCall: DrawCall;
  framebufferA: Framebuffer;
  framebufferB: Framebuffer;
  colorTextureA: Texture;
  colorTextureB: Texture;

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

    this.colorTextureA = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.colorTextureB = this.pico.createTexture2D(width, height, {
      internalFormat: PicoGL.RGBA8,
      wrapS: PicoGL.CLAMP_TO_EDGE,
      wrapT: PicoGL.CLAMP_TO_EDGE,
    });

    this.framebufferA = this.pico.createFramebuffer();
    this.framebufferA.colorTarget(0, this.colorTextureA);

    this.framebufferB = this.pico.createFramebuffer();
    this.framebufferB.colorTarget(0, this.colorTextureB);

    this.colorTexture = this.colorTextureB;
  }

  run(state: State, inputTexture: Texture) {
    for (let i = 0; i < state.fxaa; i++) {
      this.pico.drawFramebuffer(
        this.colorTexture === this.colorTextureA
          ? this.framebufferB
          : this.framebufferA,
      );
      this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
      this.pico.clear();

      this.drawCall.texture("uTexture", inputTexture);
      this.drawCall.uniform("uRes", [
        this.resolution.width,
        this.resolution.height,
      ]);
      this.drawCall.draw();

      this.colorTexture =
        this.colorTexture === this.colorTextureA
          ? this.colorTextureB
          : this.colorTextureA;

      inputTexture = this.colorTexture;
    }

    this.colorTexture = inputTexture;
  }
}
