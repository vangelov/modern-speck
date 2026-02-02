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
import { mat4 } from "gl-matrix";
import type { Pass1Initial } from "./pass-1-initial";
import type { Pass2RandRot } from "./pass-2-rand-rot";
import type { Material } from "./material";

export class Pass3Accum {
  pico: App;
  resolution: Resolution;
  drawCall: DrawCall;
  framebufferA: Framebuffer;
  framebufferB: Framebuffer;

  accumTexture: Texture | null;

  constructor(
    pico: App,
    screenVertexArray: VertexArray,
    program: Program,
    resolution: Resolution,
  ) {
    this.pico = pico;
    this.accumTexture = null;
    this.drawCall = this.pico.createDrawCall(program, screenVertexArray);
    this.setResolution(resolution);
  }

  setResolution(resolution: Resolution) {
    this.resolution = resolution;

    const colorTextureA = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.framebufferA = this.pico.createFramebuffer();
    this.framebufferA.colorTarget(0, colorTextureA);

    const colorTextureB = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.framebufferB = this.pico.createFramebuffer();
    this.framebufferB.colorTarget(0, colorTextureB);
  }

  run(
    material: Material,
    sampleCount: number,
    pass1Initial: Pass1Initial,
    pass2RandRot: Pass2RandRot,
  ) {
    if (!pass2RandRot.rot || !pass2RandRot.rect || !pass1Initial.rect) return;

    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);

    const invRot = mat4.invert(mat4.create(), pass2RandRot.rot);
    const range = material.geometry.range;

    if (!this.accumTexture)
      this.accumTexture = this.framebufferB.colorAttachments[0];

    this.pico.drawFramebuffer(
      this.accumTexture === this.framebufferB.colorAttachments[0]
        ? this.framebufferA
        : this.framebufferB,
    );

    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.drawCall.texture("uSceneDepth", pass1Initial.depthTexture);
    this.drawCall.texture("uSceneNormal", pass1Initial.normalTexture);
    this.drawCall.texture("uRandRotDepth", pass2RandRot.depthTexture);

    if (this.accumTexture)
      this.drawCall.texture("uAccumulator", this.accumTexture);

    this.drawCall.uniform("uSceneBottomLeft", [
      pass1Initial.rect.left,
      pass1Initial.rect.bottom,
    ]);
    this.drawCall.uniform("uSceneTopRight", [
      pass1Initial.rect.right,
      pass1Initial.rect.top,
    ]);
    this.drawCall.uniform("uRotBottomLeft", [
      pass2RandRot.rect.left,
      pass2RandRot.rect.bottom,
    ]);
    this.drawCall.uniform("uRotTopRight", [
      pass2RandRot.rect.right,
      pass2RandRot.rect.top,
    ]);
    this.drawCall.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.drawCall.uniform("uDepth", range);
    this.drawCall.uniform("uRot", pass2RandRot.rot);
    this.drawCall.uniform("uInvRot", invRot);
    this.drawCall.uniform("uSampleCount", sampleCount);
    this.drawCall.draw();

    this.accumTexture =
      this.accumTexture === this.framebufferB.colorAttachments[0]
        ? this.framebufferA.colorAttachments[0]
        : this.framebufferB.colorAttachments[0];
  }

  reset() {
    this.accumTexture = null;

    this.pico.drawFramebuffer(this.framebufferA);
    this.pico.clear();

    this.pico.drawFramebuffer(this.framebufferB);
    this.pico.clear();
  }
}
