import { PicoGL, type App, type VertexArray } from "picogl";
import type { Structure } from "../../types";
import { Cube } from "./cube";
import { Config } from "../../config";
import { State } from "../../state";

export class Geometry {
  pico: App;
  structure: Structure;
  range: number;

  atomsVertexArray: VertexArray;
  bondsVertexArray: VertexArray;

  constructor(pico: App, structure: Structure, state: State) {
    this.pico = pico;

    this.structure = structure;
    this.range = structure.radius * 2;

    this.createAtomsVertexArray();

    if (state.bonds && structure.bonds.length > 0) {
      console.log("create");
      this.createBondsVertexArray(state);
    }
  }

  createAtomsVertexArray() {
    const imposter: number[] = [];
    const position: number[] = [];
    const radius: number[] = [];
    const color: number[] = [];

    imposter.push(...Cube.position);

    for (const atom of this.structure.atoms) {
      const element = Config.elementsMap.get(atom.symbol);
      if (!element) continue;

      position.push(...[atom.x, atom.y, atom.z]);
      radius.push(element.radius);
      color.push(...[element.color[0], element.color[1], element.color[2]]);
    }

    const imposterBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(imposter),
    );

    const positionBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(position),
    );

    const radiusBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      1,
      new Float32Array(radius),
    );

    const colorBuffer = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(color),
    );

    const vertexArray = this.pico.createVertexArray();
    vertexArray.vertexAttributeBuffer(0, imposterBuffer);
    vertexArray.instanceAttributeBuffer(1, positionBuffer);
    vertexArray.instanceAttributeBuffer(2, radiusBuffer);
    vertexArray.instanceAttributeBuffer(3, colorBuffer);

    this.atomsVertexArray = vertexArray;
  }

  createBondsVertexArray(state: State) {
    const imposter: number[] = [];
    const posa: number[] = [];
    const posb: number[] = [];
    const rada: number[] = [];
    const radb: number[] = [];
    const cola: number[] = [];
    const colb: number[] = [];

    imposter.push(...Cube.position);

    for (const b of this.structure.bonds) {
      if (b.cutoff > state.bondThreshold) break;

      posa.push(...[b.posA.x, b.posA.y, b.posA.z]);
      posb.push(...[b.posB.x, b.posB.y, b.posB.z]);
      rada.push(...[b.radA]);
      radb.push(...[b.radB]);
      cola.push(...[b.colA.r, b.colA.g, b.colA.b]);
      colb.push(...[b.colB.r, b.colB.g, b.colB.b]);
    }

    const aImposter = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(imposter),
    );

    const aPosA = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(posa),
    );

    const aPosB = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(posb),
    );

    const aRadA = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      1,
      new Float32Array(rada),
    );

    const aRadB = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      1,
      new Float32Array(radb),
    );

    const aColA = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(cola),
    );

    const aColB = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      3,
      new Float32Array(colb),
    );

    const vertexArray = this.pico.createVertexArray();
    vertexArray.vertexAttributeBuffer(0, aImposter);
    vertexArray.instanceAttributeBuffer(1, aPosA);
    vertexArray.instanceAttributeBuffer(2, aPosB);
    vertexArray.instanceAttributeBuffer(3, aRadA);
    vertexArray.instanceAttributeBuffer(4, aRadB);
    vertexArray.instanceAttributeBuffer(5, aColA);
    vertexArray.instanceAttributeBuffer(6, aColB);

    this.bondsVertexArray = vertexArray;
  }
}
