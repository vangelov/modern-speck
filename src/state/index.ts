import { mat4, vec4 } from "gl-matrix";
import type { Resolution, Structure } from "../types";
import { Config } from "../config";
import { Lib } from "../lib";

const windowResolution: Resolution = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
};

export type State = {
  zoom: number;
  translation: {
    x: number;
    y: number;
  };
  atomScale: number;
  relativeAtomScale: number;
  bondScale: number;
  rotation: mat4;
  ao: number;
  aoResScale: number;
  brightness: number;
  outline: number;
  spf: number;
  bonds: boolean;
  bondThreshold: number;
  bondShade: number;
  atomShade: number;
  resolutionScale: number;
  dofStrength: number;
  dofPosition: number;
  fxaa: number;
};

function create(): State {
  return {
    zoom: 0.125,
    translation: {
      x: 0.0,
      y: 0.0,
    },
    atomScale: 0.6,
    relativeAtomScale: 1.0,
    bondScale: 0.5,
    rotation: mat4.create(),
    ao: 0.75,
    aoResScale: 1,
    brightness: 0.5,
    outline: 0.0,
    spf: 32,
    bonds: false,
    bondThreshold: 1.2,
    bondShade: 0.5,
    atomShade: 0.5,
    resolutionScale: 1,
    dofStrength: 0.0,
    dofPosition: 0.5,
    fxaa: 1,
  };
}

function center(state: State, structure: Structure, resolution: Resolution) {
  let maxX = -Infinity;
  let minX = Infinity;
  let maxY = -Infinity;
  let minY = Infinity;

  for (const a of structure.atoms) {
    const element = Config.elementsMap.get(a.symbol);
    if (!element) continue;

    let r = element.radius;
    r = 2.5 * state.atomScale * (1 + (r - 1) * state.relativeAtomScale);

    const p = vec4.fromValues(a.x, a.y, a.z, 0);
    vec4.transformMat4(p, p, state.rotation);

    maxX = Math.max(maxX, p[0] + r);
    minX = Math.min(minX, p[0] - r);
    maxY = Math.max(maxY, p[1] + r);
    minY = Math.min(minY, p[1] - r);
  }

  const cx = minX + (maxX - minX) / 2.0;
  const cy = minY + (maxY - minY) / 2.0;
  state.translation.x = cx;
  state.translation.y = cy;

  // compute scale separately for each axis
  var scaleX = maxX - minX;
  var scaleY = maxY - minY;

  // account for aspect ratio
  scaleX /= 1.0; // width is unaffected
  scaleY *= resolution.aspect; // height will be scaled by aspect

  var scale = Math.max(scaleX, scaleY); // choose largest after correction

  state.zoom = 1 / (scale * 1.01);
}

function override(state: State, data: Partial<State>) {
  Object.assign(state, data);
  resolve(state);
}

function resolve(state: State) {
  state.dofStrength = Lib.clamp(0, 1, state.dofStrength);
  state.dofPosition = Lib.clamp(0, 1, state.dofPosition);

  state.zoom = Lib.clamp(0.001, 2.0, state.zoom);
  state.atomScale = Lib.clamp(0, 1, state.atomScale);
  state.relativeAtomScale = Lib.clamp(0, 1, state.relativeAtomScale);
  state.bondScale = Lib.clamp(0, 1, state.bondScale);
  state.bondShade = Lib.clamp(0, 1, state.bondShade);
  state.atomShade = Lib.clamp(0, 1, state.atomShade);

  state.ao = Lib.clamp(0, 1, state.ao);
  state.brightness = Lib.clamp(0, 1, state.brightness);
  state.outline = Lib.clamp(0, 1, state.outline);
}

function translate(
  state: State,
  dx: number,
  dy: number,
  resolution: Resolution,
) {
  state.translation.x -= dx / (resolution.width * state.zoom);
  state.translation.y += dy / (resolution.height * state.zoom);
  resolve(state);
}

function rotate(state: State, dx: number, dy: number) {
  const m = mat4.create();
  mat4.rotateY(m, m, dx * 0.005);
  mat4.rotateX(m, m, dy * 0.005);
  mat4.multiply(state.rotation, m, state.rotation);
  resolve(state);
}

function getRect(state: State, resolution: Resolution) {
  const width = 1.0 / state.zoom;
  const height = width / resolution.aspect;
  const bottom = -height / 2 + state.translation.y;
  const top = height / 2 + state.translation.y;
  const left = -width / 2 + state.translation.x;
  const right = width / 2 + state.translation.x;

  return {
    bottom: bottom,
    top: top,
    left: left,
    right: right,
  };
}

function getBondRadius(state: State) {
  return (
    state.bondScale *
    state.atomScale *
    (1 + (Config.minAtomRadius - 1) * state.relativeAtomScale)
  );
}

function clone(state: State) {
  return State.deserialize(State.serialize(state));
}

function serialize(state: State) {
  return JSON.stringify(state);
}

function deserialize(data: string) {
  const state = JSON.parse(data) as State;
  state.rotation = mat4.clone(state.rotation);
  return state;
}

function getResolutions(
  state: State,
  windowWidth: number,
  windowHeight: number,
) {
  const aspect = windowWidth / windowHeight;

  const resolution = {
    width: windowWidth * state.resolutionScale,
    height: windowHeight * state.resolutionScale,
    aspect,
  };

  const aoResolution = {
    width: windowResolution.width * state.aoResScale,
    height: windowResolution.height * state.aoResScale,
    aspect,
  };

  return { resolution, aoResolution };
}

export const State = {
  create,
  center,
  override,
  translate,
  rotate,
  getRect,
  getBondRadius,
  serialize,
  deserialize,
  clone,
  resolve,
  getResolutions,
};
