export type { State } from "../state";

import type { State } from "../state";

export type Sample = {
  name: string;
  file: string;
};

export type Element = {
  symbol: string;
  name: string;
  mass: number;
  radius: number;
  color: [number, number, number];
  number: number;
};

export type Atom = {
  symbol: string;
  x: number;
  y: number;
  z: number;
};

export type Position = {
  x: number;
  y: number;
  z: number;
};

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Bond = {
  posA: Position;
  posB: Position;
  radA: number;
  radB: number;
  colA: Color;
  colB: Color;
  cutoff: number;
};

export type Structure = {
  atoms: Array<Atom>;
  radius: number;
  bonds: Array<Bond>;
};

export type Resolution = {
  width: number;
  height: number;
};

export type Rectangle = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type Scale = {
  name: string;
  factor: number;
};

export type Preset = {
  name: string;
  id: "default" | "stickball" | "toon" | "licorice";
};
