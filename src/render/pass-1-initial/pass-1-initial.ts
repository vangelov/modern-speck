import { type Framebuffer, PicoGL, type Texture, type App } from "picogl";
import type { Rectangle, Resolution } from "../../types";
import type { Material } from "../material/material";
import { State } from "../../state";

export class Pass1Initial {
  pico: App;
  resolution: Resolution;
  rect: Rectangle | null;
  framebuffer: Framebuffer;

  colorTexture: Texture;
  normalTexture: Texture;
  depthTexture: Texture;

  constructor(pico: App, resolution: Resolution) {
    this.pico = pico;
    this.rect = null;

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

    this.depthTexture = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.DEPTH_COMPONENT16,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    this.normalTexture = this.pico.createTexture2D(
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
    this.framebuffer.colorTarget(1, this.normalTexture);
    this.framebuffer.depthTarget(this.depthTexture);
  }

  run(state: State, material: Material) {
    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);
    this.pico.drawFramebuffer(this.framebuffer);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    const rect = State.getRect(state);
    this.rect = rect;

    material.draw(state, rect, this.resolution);
  }
}
