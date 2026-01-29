import { Config } from "../config";
import type { Atom } from "../types";

function findFarAtom(atoms: Array<Atom>) {
  let maxd = 0.0;
  let farAtom = atoms[0];

  for (var i = 0; i < atoms.length; i++) {
    const atom = atoms[i];

    const element = Config.elementsMap.get(atom.symbol);
    if (!element) continue;

    const r = element.radius;
    const rd = Math.sqrt(r * r + r * r + r * r) * 2.5;
    const d =
      Math.sqrt(atom.x * atom.x + atom.y * atom.y + atom.z * atom.z) + rd;

    if (d > maxd) {
      maxd = d;
      farAtom = atom;
    }
  }

  return farAtom;
}

function calculateRadius(atoms: Array<Atom>) {
  const atom = Atoms.findFarAtom(atoms);
  const r = Config.maxAtomRaduis;
  const rd = Math.sqrt(r * r + r * r + r * r) * 2.5;

  return Math.sqrt(atom.x * atom.x + atom.y * atom.y + atom.z * atom.z) + rd;
}

function getCentroid(atoms: Array<Atom>) {
  let xsum = 0;
  let ysum = 0;
  let zsum = 0;

  for (const { x, y, z } of atoms) {
    xsum += x;
    ysum += y;
    zsum += z;
  }

  return {
    x: xsum / atoms.length,
    y: ysum / atoms.length,
    z: zsum / atoms.length,
  };
}

function center(atoms: Array<Atom>) {
  const shift = getCentroid(atoms);

  for (const atom of atoms) {
    atom.x -= shift.x;
    atom.y -= shift.y;
    atom.z -= shift.z;
  }
}

export const Atoms = {
  getCentroid,
  center,
  findFarAtom,
  calculateRadius,
};
