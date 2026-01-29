import { vec3 } from "gl-matrix";

import { Config } from "../config";
import type { Atom, Bond } from "../types";

function createFromAtoms(atoms: Array<Atom>) {
  const bonds: Array<Bond> = [];
  const sorted = [...atoms].sort((a, b) => a.z - b.z);

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    let j = i + 1;

    while (
      j < sorted.length &&
      sorted[j].z < sorted[i].z + 2.5 * 2 * Config.maxAtomRaduis
    ) {
      const b = sorted[j];
      const l = vec3.fromValues(a.x, a.y, a.z);
      const m = vec3.fromValues(b.x, b.y, b.z);
      const d = vec3.distance(l, m);

      const ea = Config.elementsMap.get(a.symbol);
      const eb = Config.elementsMap.get(b.symbol);

      if (!ea || !eb) continue;

      if (d < 2.5 * (ea.radius + eb.radius)) {
        bonds.push({
          posA: {
            x: a.x,
            y: a.y,
            z: a.z,
          },
          posB: {
            x: b.x,
            y: b.y,
            z: b.z,
          },
          radA: ea.radius,
          radB: eb.radius,
          colA: {
            r: ea.color[0],
            g: ea.color[1],
            b: ea.color[2],
          },
          colB: {
            r: eb.color[0],
            g: eb.color[1],
            b: eb.color[2],
          },
          cutoff: d / (ea.radius + eb.radius),
        });
      }
      j++;
    }
  }

  bonds.sort((a, b) => a.cutoff - b.cutoff);

  return bonds;
}

export const Bonds = {
  createFromAtoms,
};
