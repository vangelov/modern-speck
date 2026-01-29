import { Lib } from "../lib";
import type { Atom, Structure } from "../types";
import { Bonds } from "./bonds";
import { Atoms } from "./atoms";

export function createFromText(text: string): Structure | null {
  const atoms: Array<Atom> = [];

  const frames = Lib.parseXYZ(text);
  if (frames.length === 0) return null;

  const firstFrame = frames[0];
  for (let i = 0; i < firstFrame.length; i++) {
    const atom = firstFrame[i];
    const { symbol, position } = atom;
    const [x, y, z] = position;
    atoms.push({ symbol, x, y, z });
  }

  Atoms.center(atoms);

  const bonds = Bonds.createFromAtoms(atoms);
  const radius = Atoms.calculateRadius(atoms);

  return {
    radius,
    atoms,
    bonds,
  };
}

export const Structures = {
  createFromText,
};
