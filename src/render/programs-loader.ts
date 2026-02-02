import type { App, Program } from "picogl";
import { AtomsProgram } from "./programs/atoms";
import { TexturedQuadProgram } from "./programs/textured-quad";
import { BondsProgram } from "./programs/bonds";
import { AOProgram } from "./programs/ao";
import { AccumulatorProgram } from "./programs/accumulator";
import { FXAAProgram } from "./programs/fxaa";
import { DOFProgram } from "./programs/dof";

export class ProgramsLoader {
  progDisplayQuad: Program;
  progAtoms: Program;
  progBonds: Program;
  progAO: Program;
  progAccumulator: Program;
  progFXAA: Program;
  progDOF: Program;

  constructor([
    progAtoms,
    progDisplayQuad,
    progBonds,
    progAO,
    progAccumulator,
    progFXAA,
    progDOF,
  ]: Program[]) {
    this.progDisplayQuad = progDisplayQuad;
    this.progAtoms = progAtoms;
    this.progBonds = progBonds;
    this.progAO = progAO;
    this.progAccumulator = progAccumulator;
    this.progFXAA = progFXAA;
    this.progDOF = progDOF;
  }

  static async load(pico: App) {
    const programs = await pico.createPrograms(
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

    return new ProgramsLoader(programs);
  }
}
