import { type Framebuffer, PicoGL, type Texture, type App } from "picogl";
import type { Rectangle, Resolution } from "../types";
import type { Material } from "./material";
import { State } from "../state";
import { mat4, vec3 } from "gl-matrix";

export class Pass2RandRot {
  pico: App;
  resolution: Resolution;
  framebuffer: Framebuffer;
  colorTexture: Texture;
  depthTexture: Texture;

  rect: Rectangle | null;
  rot: mat4 | null;

  constructor(pico: App, resolution: Resolution) {
    this.pico = pico;
    this.rect = null;
    this.rot = null;

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

    this.framebuffer = this.pico.createFramebuffer();
    this.framebuffer.colorTarget(0, this.colorTexture);
    this.framebuffer.depthTarget(this.depthTexture);
  }

  run(state: State, material: Material) {
    const range = material.geometry.range;

    const v = State.clone(state);
    v.zoom = 1 / range;
    v.translation.x = 0;
    v.translation.y = 0;

    const rot = mat4.create();
    for (let i = 0; i < 3; i++) {
      const axis = vec3.random(vec3.create(), 1.0);
      mat4.rotate(rot, rot, Math.random() * 10, axis);
    }
    v.rotation = mat4.multiply(mat4.create(), rot, v.rotation);

    const rect = State.getRect(state);
    this.rect = rect;
    this.rot = rot;

    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);
    this.pico.drawFramebuffer(this.framebuffer);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    material.draw(v, rect, this.resolution);
  }
}
