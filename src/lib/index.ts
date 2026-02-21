import { isKeyPressed } from "./key";
import { parseXYZ } from "./xyz";

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

export const Lib = {
  parseXYZ,
  clamp,
  isKeyPressed,
};
