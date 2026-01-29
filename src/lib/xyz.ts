export function parseXYZ(data: string) {
  const lines = data.split("\n");
  const natoms = parseInt(lines[0]);
  const nframes = Math.floor(lines.length / (natoms + 2));
  const trajectory = [];

  for (let i = 0; i < nframes; i++) {
    const atoms = [];

    for (let j = 0; j < natoms; j++) {
      const line = lines[i * (natoms + 2) + j + 2].split(/\s+/);

      let k = 0;
      while (line[k] == "") k++;

      atoms.push({
        symbol: line[k++],
        position: [
          parseFloat(line[k++]),
          parseFloat(line[k++]),
          parseFloat(line[k++]),
        ],
      });
    }

    trajectory.push(atoms);
  }

  return trajectory;
}
