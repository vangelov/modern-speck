import { type DrawCall, type Program, type App } from "picogl";
import type { Rectangle, Resolution } from "../../types";
import { State } from "../../state";
import { mat4 } from "gl-matrix";
import type { Geometry } from "../geometry/geometry";
import { AtomsProgramSrc } from "./atoms-program-src";
import { BondsProgramSrc } from "./bonds-program-src";

export class Material {
  static AtomsProgramSrc = AtomsProgramSrc;
  static BondsProgramSrc = BondsProgramSrc;

  pico: App;
  geometry: Geometry;

  atomsDrawCall: DrawCall;
  bondsDrawCall?: DrawCall;

  constructor(
    pico: App,
    geometry: Geometry,
    atomsProgram: Program,
    bondsProgram: Program,
  ) {
    this.pico = pico;

    this.geometry = geometry;

    this.atomsDrawCall = this.pico.createDrawCall(
      atomsProgram,
      geometry.atomsVertexArray,
    );

    if (geometry.bondsVertexArray) {
      this.bondsDrawCall = this.pico.createDrawCall(
        bondsProgram,
        geometry.bondsVertexArray,
      );
    }
  }

  draw(state: State, rect: Rectangle, resolution: Resolution) {
    const range = this.geometry.range;

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

    const view = mat4.create();
    mat4.lookAt(view, [0, 0, 0], [0, 0, -1], [0, 1, 0]);

    const model = mat4.create();
    mat4.translate(model, model, [0, 0, -range / 2]);
    mat4.multiply(model, model, state.rotation);

    this.atomsDrawCall.uniform("uProjection", projection);
    this.atomsDrawCall.uniform("uView", view);
    this.atomsDrawCall.uniform("uModel", model);
    this.atomsDrawCall.uniform("uBottomLeft", [rect.left, rect.bottom]);
    this.atomsDrawCall.uniform("uTopRight", [rect.right, rect.top]);
    this.atomsDrawCall.uniform("uAtomScale", 2.5 * state.atomScale);
    this.atomsDrawCall.uniform("uRelativeAtomScale", state.relativeAtomScale);
    this.atomsDrawCall.uniform("uRes", [resolution.width, resolution.height]);
    this.atomsDrawCall.uniform("uDepth", range);
    this.atomsDrawCall.uniform("uAtomShade", state.atomShade);
    this.atomsDrawCall.draw();

    if (this.bondsDrawCall) {
      this.bondsDrawCall.uniform("uProjection", projection);
      this.bondsDrawCall.uniform("uView", view);
      this.bondsDrawCall.uniform("uModel", model);
      this.bondsDrawCall.uniform("uBottomLeft", [rect.left, rect.bottom]);
      this.bondsDrawCall.uniform("uTopRight", [rect.right, rect.top]);
      this.bondsDrawCall.uniform("uRotation", state.rotation);
      this.bondsDrawCall.uniform("uDepth", range);
      this.bondsDrawCall.uniform("uRes", [resolution.width, resolution.height]);
      this.bondsDrawCall.uniform(
        "uBondRadius",
        2.5 * State.getBondRadius(state),
      );
      this.bondsDrawCall.uniform("uBondShade", state.bondShade);
      this.bondsDrawCall.uniform("uAtomScale", 2.5 * state.atomScale);
      this.bondsDrawCall.uniform("uRelativeAtomScale", state.relativeAtomScale);
      this.bondsDrawCall.draw();
    }
  }
}
