import {
  type Texture,
  type App,
  type Framebuffer,
  type Program,
  type DrawCall,
} from "picogl";
import PicoGL from "picogl";
import type { Resolution, Structure } from "../types";
import { Cube } from "./cube";
import { Config } from "../config";
import { AtomsProgram } from "./programs/atoms";
import { TexturedQuadProgram } from "./programs/textured-quad";
import { State } from "../state";
import { mat4, vec3 } from "gl-matrix";
import { BondsProgram } from "./programs/bonds";
import { AOProgram } from "./programs/ao";
import { AccumulatorProgram } from "./programs/accumulator";
import { FXAAProgram } from "./programs/fxaa";
import { DOFProgram } from "./programs/dof";

type Programs = {
  progAtoms: Program;
  progDisplayQuad: Program;
  progBonds: Program;
  progAO: Program;
  progAccumulator: Program;
  progFXAA: Program;
  progDOF: Program;
};

export class Renderer {
  pico: App;

  rDispQuad: DrawCall;
  rAccumulator: DrawCall;
  rFXAA: DrawCall;
  rAO: DrawCall;
  rDOF: DrawCall;
  rAtoms: DrawCall | null;
  rBonds: DrawCall | null;
  structure: Structure | null;

  progDisplayQuad: Program;
  progAtoms: Program;
  progBonds: Program;
  progAO: Program;
  progAccumulator: Program;
  progFXAA: Program;
  progDOF: Program;

  fbSceneColor: Framebuffer;
  fbRandRot: Framebuffer;
  fbDOF: Framebuffer;

  fbAccumulator: Framebuffer;
  fbAccumulatorCopy: Framebuffer;

  fbAO: Framebuffer;

  fbFXAA: Framebuffer;
  fbFXAACopy: Framebuffer;

  accumTexture: Texture | null;

  sampleCount = 0;
  colorRendered = false;
  normalRendered = false;

  range: number;
  resolution: Resolution;
  aoResolution: Resolution;

  constructor(
    pico: App,
    resolution: Resolution,
    aoResolution: Resolution,
    {
      progAtoms,
      progDisplayQuad,
      progBonds,
      progAO,
      progAccumulator,
      progFXAA,
      progDOF,
    }: Programs,
  ) {
    this.pico = pico;

    this.progAtoms = progAtoms;
    this.progDisplayQuad = progDisplayQuad;
    this.progBonds = progBonds;
    this.progAO = progAO;
    this.progAccumulator = progAccumulator;
    this.progFXAA = progFXAA;
    this.progDOF = progDOF;

    this.accumTexture = null;

    this.rAtoms = null;
    this.structure = null;

    this.resolution = resolution;
    this.aoResolution = aoResolution;

    this.createVertexArrays();
    this.createFramebuffers();
  }

  static async create(
    canvas: HTMLCanvasElement,
    resolution: Resolution,
    aoResolution: Resolution,
  ) {
    const pico = PicoGL.createApp(canvas);
    pico.clearColor(0.0, 0.0, 0.0, 1.0);
    pico.enable(PicoGL.DEPTH_TEST);
    pico.enable(PicoGL.CULL_FACE);
    pico.clearColor(0, 0, 0, 0);
    pico.gl.clearDepth(1.0);

    const [
      progAtoms,
      progDisplayQuad,
      progBonds,
      progAO,
      progAccumulator,
      progFXAA,
      progDOF,
    ] = await pico.createPrograms(
      [AtomsProgram.vertexShaderSrc, AtomsProgram.fragmentShaderSrc],
      [
        TexturedQuadProgram.vertexShaderSrc,
        TexturedQuadProgram.fragmentShaderSrc,
      ],

      [BondsProgram.vertexShaderSrc, BondsProgram.fragmentShaderSrc],

      [AOProgram.vertexShaderSrc, AOProgram.fragmentShaderSrc],
      [
        AccumulatorProgram.vertexShaderSrc,
        AccumulatorProgram.fragmentShaderSrc,
      ],

      [FXAAProgram.vertexShaderSrc, FXAAProgram.fragmentShaderSrc],

      [DOFProgram.vertexShaderSrc, DOFProgram.fragmentShaderSrc],
    );

    return new Renderer(pico, resolution, aoResolution, {
      progAtoms,
      progDisplayQuad,
      progBonds,
      progAO,
      progAccumulator,
      progFXAA,
      progDOF,
    });
  }

  createVertexArrays() {
    const positions = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    );

    const vertexArray = this.pico.createVertexArray();
    vertexArray.vertexAttributeBuffer(0, positions);

    this.rDispQuad = this.pico.createDrawCall(
      this.progDisplayQuad,
      vertexArray,
    );

    this.rAccumulator = this.pico.createDrawCall(
      this.progAccumulator,
      vertexArray,
    );

    this.rAO = this.pico.createDrawCall(this.progAO, vertexArray);

    this.rFXAA = this.pico.createDrawCall(this.progFXAA, vertexArray);

    this.rDOF = this.pico.createDrawCall(this.progDOF, vertexArray);
  }

  createFramebuffers() {
    const tSceneColor = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    const tSceneDepth = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.DEPTH_COMPONENT16,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    const tSceneNormal = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.fbSceneColor = this.pico.createFramebuffer();
    this.fbSceneColor.colorTarget(0, tSceneColor);
    this.fbSceneColor.colorTarget(1, tSceneNormal);
    this.fbSceneColor.depthTarget(tSceneDepth);

    //

    const tRandRotColor = this.pico.createTexture2D(
      this.aoResolution.width,
      this.aoResolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    const tRandRotDepth = this.pico.createTexture2D(
      this.aoResolution.width,
      this.aoResolution.height,
      {
        internalFormat: PicoGL.DEPTH_COMPONENT16,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    this.fbRandRot = this.pico.createFramebuffer();
    this.fbRandRot.colorTarget(0, tRandRotColor);
    this.fbRandRot.depthTarget(tRandRotDepth);

    //

    const tAccumulatorOut = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.fbAccumulator = this.pico.createFramebuffer();
    this.fbAccumulator.colorTarget(0, tAccumulatorOut);

    const tAccumulator = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.fbAccumulatorCopy = this.pico.createFramebuffer();
    this.fbAccumulatorCopy.colorTarget(0, tAccumulator);

    //

    const tFXAAOut = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.fbFXAA = this.pico.createFramebuffer();
    this.fbFXAA.colorTarget(0, tFXAAOut);

    const tFXAA = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );
    this.fbFXAACopy = this.pico.createFramebuffer();
    this.fbFXAACopy.colorTarget(0, tFXAA);

    //

    const tAO = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    this.fbAO = this.pico.createFramebuffer();
    this.fbAO.colorTarget(0, tAO);

    //

    const tDOF = this.pico.createTexture2D(
      this.resolution.width,
      this.resolution.height,
      {
        internalFormat: PicoGL.RGBA8,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
      },
    );

    this.fbDOF = this.pico.createFramebuffer();
    this.fbDOF.colorTarget(0, tDOF);
  }

  setResolution(resolution: Resolution, aoResolution: Resolution) {
    this.aoResolution = aoResolution;
    this.resolution = resolution;
    this.pico.resize(resolution.width, resolution.height);

    this.createFramebuffers();
  }

  setStructure(structure: Structure, state: State) {
    const imposter: number[] = [];
    const position: number[] = [];
    const radius: number[] = [];
    const color: number[] = [];

    for (const atom of structure.atoms) {
      const element = Config.elementsMap.get(atom.symbol);
      if (!element) continue;

      imposter.push(...Cube.position);

      position.push(...[atom.x, atom.y, atom.z]);
      radius.push(element.radius);
      color.push(...[element.color[0], element.color[1], element.color[2]]);
    }

    const imposterBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(imposter),
    );

    const positionBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(position),
    );

    const radiusBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      1,
      new Float32Array(radius),
    );

    const colorBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(color),
    );

    const vertexArray = this.pico.createVertexArray();
    vertexArray.vertexAttributeBuffer(0, imposterBuffer);
    vertexArray.instanceAttributeBuffer(1, positionBuffer);
    vertexArray.instanceAttributeBuffer(2, radiusBuffer);
    vertexArray.instanceAttributeBuffer(3, colorBuffer);

    this.rAtoms = this.pico.createDrawCall(this.progAtoms, vertexArray);
    this.structure = structure;

    if (state.bonds) {
      this.rBonds = null;

      if (structure.bonds.length > 0) {
        const imposter: number[] = [];
        const posa: number[] = [];
        const posb: number[] = [];
        const rada: number[] = [];
        const radb: number[] = [];
        const cola: number[] = [];
        const colb: number[] = [];

        for (const b of structure.bonds) {
          if (b.cutoff > state.bondThreshold) break;

          imposter.push(...Cube.position);
          posa.push(...[b.posA.x, b.posA.y, b.posA.z]);
          posb.push(...[b.posB.x, b.posB.y, b.posB.z]);
          rada.push(...[b.radA]);
          radb.push(...[b.radB]);
          cola.push(...[b.colA.r, b.colA.g, b.colA.b]);
          colb.push(...[b.colB.r, b.colB.g, b.colB.b]);
        }

        const aImposter = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          3,
          new Float32Array(imposter),
        );

        const aPosA = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          3,
          new Float32Array(posa),
        );

        const aPosB = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          3,
          new Float32Array(posb),
        );

        const aRadA = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          1,
          new Float32Array(rada),
        );

        const aRadB = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          1,
          new Float32Array(radb),
        );

        const aColA = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          3,
          new Float32Array(cola),
        );

        const aColB = this.pico.createVertexBuffer(
          PicoGL.FLOAT,
          3,
          new Float32Array(colb),
        );

        const vertexArray2 = this.pico.createVertexArray();
        vertexArray2.vertexAttributeBuffer(0, aImposter);
        vertexArray2.instanceAttributeBuffer(1, aPosA);
        vertexArray2.instanceAttributeBuffer(2, aPosB);
        vertexArray2.instanceAttributeBuffer(3, aRadA);
        vertexArray2.instanceAttributeBuffer(4, aRadB);
        vertexArray2.instanceAttributeBuffer(5, aColA);
        vertexArray2.instanceAttributeBuffer(6, aColB);

        this.rBonds = this.pico.createDrawCall(this.progBonds, vertexArray2);
      }
    }
  }

  render(state: State) {
    if (!this.colorRendered) {
      this.color(state);
    } else {
      for (var i = 0; i < state.spf; i++) {
        if (this.sampleCount > 1024) {
          break;
        }
        this.sample(state);
        this.sampleCount++;
      }
    }
    this.display(state);
  }

  color(state: State) {
    if (!this.rAtoms || !this.structure) return;

    this.colorRendered = true;

    const range = this.structure.radius * 2;

    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);

    this.pico.drawFramebuffer(this.fbSceneColor);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    const rect = State.getRect(state, this.resolution);
    const projection = mat4.create();
    mat4.ortho(
      projection,
      rect.left,
      rect.right,
      rect.bottom,
      rect.top,
      0,
      range,
    );

    const viewMat = mat4.create();
    mat4.lookAt(viewMat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);

    const model = mat4.create();
    mat4.translate(model, model, [0, 0, -range / 2]);
    mat4.multiply(model, model, state.rotation);

    this.rAtoms.uniform("uProjection", projection);
    this.rAtoms.uniform("uView", viewMat);
    this.rAtoms.uniform("uModel", model);
    this.rAtoms.uniform("uBottomLeft", [rect.left, rect.bottom]);
    this.rAtoms.uniform("uTopRight", [rect.right, rect.top]);
    this.rAtoms.uniform("uAtomScale", 2.5 * state.atomScale);
    this.rAtoms.uniform("uRelativeAtomScale", state.relativeAtomScale);
    this.rAtoms.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.rAtoms.uniform("uDepth", range);
    this.rAtoms.uniform("uAtomShade", state.atomShade);
    this.rAtoms.draw();

    if (state.bonds && this.rBonds != null) {
      this.pico.drawFramebuffer(this.fbSceneColor);

      this.rBonds.uniform("uProjection", projection);
      this.rBonds.uniform("uView", viewMat);
      this.rBonds.uniform("uModel", model);
      this.rBonds.uniform("uRotation", state.rotation);
      this.rBonds.uniform("uDepth", range);
      this.rBonds.uniform("uBottomLeft", [rect.left, rect.bottom]);
      this.rBonds.uniform("uTopRight", [rect.right, rect.top]);
      this.rBonds.uniform("uRes", [
        this.resolution.width,
        this.resolution.height,
      ]);
      this.rBonds.uniform("uBondRadius", 2.5 * State.getBondRadius(state));
      this.rBonds.uniform("uBondShade", state.bondShade);
      this.rBonds.uniform("uAtomScale", 2.5 * state.atomScale);
      this.rBonds.uniform("uRelativeAtomScale", state.relativeAtomScale);
      this.rBonds.draw();
    }
  }

  sample(state: State) {
    if (!this.rAtoms || !this.structure) return;

    this.pico.viewport(0, 0, this.aoResolution.width, this.aoResolution.height);
    const v = State.clone(state);
    const range = this.structure.radius * 2;

    v.zoom = 1 / range;
    v.translation.x = 0;
    v.translation.y = 0;

    const rot = mat4.create();
    for (let i = 0; i < 3; i++) {
      const axis = vec3.random(vec3.create(), 1.0);
      mat4.rotate(rot, rot, Math.random() * 10, axis);
    }
    v.rotation = mat4.multiply(mat4.create(), rot, v.rotation);

    this.pico.drawFramebuffer(this.fbRandRot);
    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    const rect = State.getRect(v, this.resolution);
    const projection = mat4.create();
    mat4.ortho(
      projection,
      rect.left,
      rect.right,
      rect.bottom,
      rect.top,
      0,
      range,
    );
    const viewMat = mat4.create();
    mat4.lookAt(viewMat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);

    const model = mat4.create();
    mat4.translate(model, model, [0, 0, -range / 2]);
    mat4.multiply(model, model, v.rotation);

    this.rAtoms.uniform("uProjection", projection);
    this.rAtoms.uniform("uView", viewMat);
    this.rAtoms.uniform("uModel", model);
    this.rAtoms.uniform("uBottomLeft", [rect.left, rect.bottom]);
    this.rAtoms.uniform("uTopRight", [rect.right, rect.top]);
    this.rAtoms.uniform("uAtomScale", 2.5 * v.atomScale);
    this.rAtoms.uniform("uRelativeAtomScale", v.relativeAtomScale);
    this.rAtoms.uniform("uRes", [
      this.aoResolution.width,
      this.aoResolution.height,
    ]);
    this.rAtoms.uniform("uDepth", range);
    this.rAtoms.uniform("uMode", 0);
    this.rAtoms.uniform("uAtomShade", v.atomShade);
    this.rAtoms.draw();

    if (state.bonds && this.rBonds != null) {
      this.rBonds.uniform("uProjection", projection);
      this.rBonds.uniform("uView", viewMat);
      this.rBonds.uniform("uModel", model);
      this.rBonds.uniform("uRotation", v.rotation);
      this.rBonds.uniform("uDepth", range);
      this.rBonds.uniform("uBottomLeft", [rect.left, rect.bottom]);
      this.rBonds.uniform("uTopRight", [rect.right, rect.top]);
      this.rAtoms.uniform("uRes", [
        this.aoResolution.width,
        this.aoResolution.height,
      ]);
      this.rBonds.uniform("uBondRadius", 2.5 * State.getBondRadius(state));
      this.rBonds.uniform("uBondShade", state.bondShade);
      this.rBonds.uniform("uAtomScale", 2.5 * state.atomScale);
      this.rBonds.uniform("uRelativeAtomScale", state.relativeAtomScale);
      this.rBonds.uniform("uMode", 0);
      this.rBonds.draw();
    }

    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);
    const sceneRect = State.getRect(state, this.resolution);
    const rotRect = State.getRect(v, this.resolution);
    const invRot = mat4.invert(mat4.create(), rot);

    if (!this.accumTexture)
      this.accumTexture = this.fbAccumulatorCopy.colorAttachments[0];

    this.pico.drawFramebuffer(
      this.accumTexture === this.fbAccumulatorCopy.colorAttachments[0]
        ? this.fbAccumulator
        : this.fbAccumulatorCopy,
    );

    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.rAccumulator.texture(
      "uSceneDepth",
      this.fbSceneColor.depthAttachment as Texture,
    );
    this.rAccumulator.texture(
      "uSceneNormal",
      this.fbSceneColor.colorAttachments[1],
    );
    this.rAccumulator.texture(
      "uRandRotDepth",
      this.fbRandRot.depthAttachment as Texture,
    );
    if (this.accumTexture)
      this.rAccumulator.texture("uAccumulator", this.accumTexture);

    this.rAccumulator.uniform("uSceneBottomLeft", [
      sceneRect.left,
      sceneRect.bottom,
    ]);
    this.rAccumulator.uniform("uSceneTopRight", [
      sceneRect.right,
      sceneRect.top,
    ]);
    this.rAccumulator.uniform("uRotBottomLeft", [rotRect.left, rotRect.bottom]);
    this.rAccumulator.uniform("uRotTopRight", [rotRect.right, rotRect.top]);
    this.rAccumulator.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.rAccumulator.uniform("uDepth", range);
    this.rAccumulator.uniform("uRot", rot);
    this.rAccumulator.uniform("uInvRot", invRot);
    this.rAccumulator.uniform("uSampleCount", this.sampleCount);
    this.rAccumulator.draw();

    this.accumTexture =
      this.accumTexture === this.fbAccumulatorCopy.colorAttachments[0]
        ? this.fbAccumulator.colorAttachments[0]
        : this.fbAccumulatorCopy.colorAttachments[0];

    // this.pico.readFramebuffer(this.fbAccumulator);
    // this.pico.drawFramebuffer(this.fbAccumulatorCopy);
    // this.pico.blitFramebuffer(PicoGL.COLOR_BUFFER_BIT, {
    //   filter: PicoGL.NEAREST,
    // });
  }

  display(state: State) {
    this.pico.viewport(0, 0, this.resolution.width, this.resolution.height);

    this.pico.drawFramebuffer(this.fbAO);

    this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
    this.pico.clear();

    this.rAO.texture("uSceneColor", this.fbSceneColor.colorAttachments[0]);
    this.rAO.texture(
      "uSceneDepth",
      this.fbSceneColor.depthAttachment as Texture,
    );
    this.rAO.texture(
      "uAccumulatorOut",
      this.accumTexture || this.fbAccumulatorCopy.colorAttachments[0],
    );
    this.rAO.uniform("uRes", [this.resolution.width, this.resolution.height]);
    this.rAO.uniform("uAO", 2.0 * state.ao);
    this.rAO.uniform("uBrightness", 2.0 * state.brightness);
    this.rAO.uniform("uOutlineStrength", state.outline);
    this.rAO.draw();

    let lastT = this.fbAO.colorAttachments[0];

    if (state.fxaa > 0) {
      //   if (state.dofStrength > 0) {
      //     this.pico.drawFramebuffer(this.fbFXAA);
      //   } else {
      //     this.pico.defaultDrawFramebuffer();
      //   }

      let cT = lastT;

      for (let i = 0; i < state.fxaa; i++) {
        const f =
          cT === lastT
            ? this.fbFXAA
            : cT === this.fbFXAACopy.colorAttachments[0]
              ? this.fbFXAA
              : this.fbFXAACopy;
        this.pico.drawFramebuffer(f);

        this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
        this.pico.clear();

        this.rFXAA.texture("uTexture", cT);

        this.rFXAA.uniform("uRes", [
          this.resolution.width,
          this.resolution.height,
        ]);
        this.rFXAA.draw();

        // this.pico.drawFramebuffer(this.fbFXAACopy);
        // this.pico.blitFramebuffer(PicoGL.COLOR_BUFFER_BIT, {
        //   filter: PicoGL.NEAREST,
        // });

        cT =
          cT === lastT
            ? this.fbFXAA.colorAttachments[0]
            : cT === this.fbFXAA.colorAttachments[0]
              ? this.fbFXAACopy.colorAttachments[0]
              : this.fbFXAA.colorAttachments[0];
      }

      lastT = cT;
    }

    if (state.dofStrength > 0) {
      this.pico.drawFramebuffer(this.fbDOF);
      this.pico.clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT);
      this.pico.clear();

      this.rDOF.texture("uColor", lastT);
      this.rDOF.texture("uDepth", this.fbSceneColor.depthAttachment as Texture);
      this.rDOF.uniform("uDOFPosition", state.dofPosition);
      this.rDOF.uniform("uDOFStrength", state.dofStrength);
      this.rDOF.uniform("uRes", [
        this.resolution.width,
        this.resolution.height,
      ]);
      this.rDOF.draw();

      lastT = this.fbDOF.colorAttachments[0];
    }

    this.pico.defaultDrawFramebuffer();
    this.rDispQuad.texture("uTexture", lastT);
    this.rDispQuad.uniform("uRes", [
      this.resolution.width,
      this.resolution.height,
    ]);
    this.rDispQuad.draw();
  }

  reset() {
    this.sampleCount = 0;
    this.colorRendered = false;
    this.normalRendered = false;

    this.accumTexture = null;

    this.pico.drawFramebuffer(this.fbAccumulator);
    this.pico.clear();

    this.pico.drawFramebuffer(this.fbAccumulatorCopy);
    this.pico.clear();
  }
}
