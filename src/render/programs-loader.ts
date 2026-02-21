import type { App, Program } from "picogl";
import { Material } from "./material/material";
import { Pass3Accum } from "./pass-3-accum/pass-3-accum";
import { Pass4AO } from "./pass-4-ao/pass-4-ao";
import { Pass5FXAA } from "./pass-5-fxaa/pass-5-fxaa";
import { Pass6DOF } from "./pass-6-dof/pass-6-dof";
import { Pass7Display } from "./pass-7-display/pass-7-display";

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
    progBonds,
    progAccumulator,
    progAO,

    progFXAA,
    progDOF,
    progDisplayQuad,
  ]: Program[]) {
    this.progDisplayQuad = progDisplayQuad;
    this.progAtoms = progAtoms;
    this.progBonds = progBonds;
    this.progAccumulator = progAccumulator;
    this.progAO = progAO;
    this.progFXAA = progFXAA;
    this.progDOF = progDOF;
  }

  static async load(pico: App) {
    const programs = await pico.createPrograms(
      Material.AtomsProgramSrc,
      Material.BondsProgramSrc,
      Pass3Accum.AccumProgramSrc,
      Pass4AO.AOProgramSrc,
      Pass5FXAA.FXAAProgramSrc,
      Pass6DOF.DOFProgramSrc,
      Pass7Display.DisplayProgramSrc,
    );

    return new ProgramsLoader(programs);
  }
}
