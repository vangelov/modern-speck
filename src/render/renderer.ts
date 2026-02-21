import { PicoGL, type App } from "picogl";
import type { Resolution, Structure } from "../types";
import { State } from "../state";
import { ProgramsLoader } from "./programs-loader";
import { Pass1Initial } from "./pass-1-initial/pass-1-initial";
import { Pass7Display } from "./pass-7-display/pass-7-display";
import { Material } from "./material/material";
import { Geometry } from "./geometry/geometry";
import { Pass2RandRot } from "./pass-2-rand-rot/pass-2-rand-rot";
import { Pass3Accum } from "./pass-3-accum/pass-3-accum";
import { Pass4AO } from "./pass-4-ao/pass-4-ao";
import { Pass5FXAA } from "./pass-5-fxaa/pass-5-fxaa";
import { Pass6DOF } from "./pass-6-dof/pass-6-dof";

export class Renderer {
  pico: App;
  sampleCount = 0;
  colorRendered = false;
  normalRendered = false;
  resolution: Resolution;
  aoResolution: Resolution;
  programsLoader: ProgramsLoader;

  material: Material | null;
  structure: Structure;
  pass1Initiial: Pass1Initial;
  pass2RandRot: Pass2RandRot;
  pass3Accum: Pass3Accum;
  pass4AO: Pass4AO;
  pass5FXAA: Pass5FXAA;
  pass6DOF: Pass6DOF;
  pass7Display: Pass7Display;

  constructor(
    pico: App,
    resolution: Resolution,
    aoResolution: Resolution,
    programsLoader: ProgramsLoader,
  ) {
    this.pico = pico;
    this.resolution = resolution;
    this.aoResolution = aoResolution;
    this.programsLoader = programsLoader;
    this.material = null;

    const positions = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    );
    const screenVertexArray = this.pico.createVertexArray();
    screenVertexArray.vertexAttributeBuffer(0, positions);

    this.pass1Initiial = new Pass1Initial(pico, resolution);
    this.pass2RandRot = new Pass2RandRot(pico, aoResolution);
    this.pass3Accum = new Pass3Accum(
      pico,
      screenVertexArray,
      programsLoader.progAccumulator,
      resolution,
    );
    this.pass4AO = new Pass4AO(
      pico,
      screenVertexArray,
      programsLoader.progAO,
      resolution,
    );
    this.pass5FXAA = new Pass5FXAA(
      pico,
      screenVertexArray,
      programsLoader.progFXAA,
      resolution,
    );
    this.pass6DOF = new Pass6DOF(
      pico,
      screenVertexArray,
      programsLoader.progDOF,
      resolution,
    );
    this.pass7Display = new Pass7Display(
      pico,
      screenVertexArray,
      programsLoader.progDisplayQuad,
      resolution,
    );
  }

  static async create(canvas: HTMLCanvasElement, state: State) {
    const pico = PicoGL.createApp(canvas);
    pico.enable(PicoGL.DEPTH_TEST);
    pico.enable(PicoGL.CULL_FACE);
    pico.clearColor(0, 0, 0, 0);
    pico.gl.clearDepth(1.0);

    const programsLoader = await ProgramsLoader.load(pico);
    const { resolution, aoResolution } = State.getResolutions(state);

    return new Renderer(pico, resolution, aoResolution, programsLoader);
  }

  setResolution(state: State) {
    const { resolution, aoResolution } = State.getResolutions(state);

    this.aoResolution = aoResolution;
    this.resolution = resolution;
    this.pico.resize(resolution.width, resolution.height);

    this.pass1Initiial.setResolution(resolution);
    this.pass2RandRot.setResolution(aoResolution);
    this.pass3Accum.setResolution(resolution);
    this.pass4AO.setResolution(resolution);
    this.pass5FXAA.setResolution(resolution);
    this.pass6DOF.setResolution(resolution);
    this.pass7Display.setResolution(resolution);
  }

  setStructure(structure: Structure, state: State) {
    this.structure = structure;
    const geometry = new Geometry(this.pico, structure, state);

    this.material = new Material(
      this.pico,
      geometry,
      this.programsLoader.progAtoms,
      this.programsLoader.progBonds,
    );
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
    if (!this.material) return;
    this.colorRendered = true;

    this.pass1Initiial.run(state, this.material);
  }

  sample(state: State) {
    if (!this.material) return;

    this.pass2RandRot.run(state, this.material);
    this.pass3Accum.run(
      this.material,
      this.sampleCount,
      this.pass1Initiial,
      this.pass2RandRot,
    );
  }

  display(state: State) {
    let displayTexture = this.pass1Initiial.colorTexture;

    this.pass4AO.run(state, this.pass1Initiial, this.pass3Accum);
    displayTexture = this.pass4AO.colorTexture;

    if (state.fxaa > 0) {
      this.pass5FXAA.run(state, displayTexture);
      displayTexture = this.pass5FXAA.colorTexture;
    }

    if (state.dofStrength > 0) {
      this.pass6DOF.run(state, this.pass1Initiial, displayTexture);
      displayTexture = this.pass6DOF.colorTexture;
    }

    this.pass7Display.run(displayTexture);
  }

  reset() {
    this.sampleCount = 0;
    this.colorRendered = false;
    this.normalRendered = false;

    this.pass3Accum.reset();
  }
}
