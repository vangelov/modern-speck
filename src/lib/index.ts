import { isKeyPressed } from "./key";
import { parseXYZ } from "./xyz";

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

const canvas = document.createElement("canvas");
function supportsMIMEType(type: string) {
  return canvas.toDataURL(type).startsWith(`data:${type}`);
}

export const Lib = {
  parseXYZ,
  clamp,
  isKeyPressed,
  supportsMIMEType,
};
