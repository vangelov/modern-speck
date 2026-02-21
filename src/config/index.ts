import { elements } from "./elements";
import { samples } from "./samples";
import { scales } from "./scales";
import { presents, overridesMap } from "./presets";

const elementsMap = new Map(
  elements.map((element) => [element.symbol, element]),
);

let minAtomRadius = +Infinity;
let maxAtomRaduis = -Infinity;

for (let i = 0; i < elements.length; i++) {
  minAtomRadius = Math.min(minAtomRadius, elements[i].radius);
  maxAtomRaduis = Math.max(maxAtomRaduis, elements[i].radius);
}

export const Config = {
  samples,
  scales,
  presents,
  overridesMap,
  elementsMap,
  minAtomRadius,
  maxAtomRaduis,
};
