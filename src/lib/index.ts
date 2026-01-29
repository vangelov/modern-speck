import { isKeyPressed } from "./key";
import { parseXYZ } from "./xyz";

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, value: number): number {
  return (value - a) / (b - a);
}

function memoize1<T extends object, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new WeakMap<T, R>();

  return (arg: T): R => {
    const cached = cache.get(arg);
    if (cached !== undefined) return cached;

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

function memoize2<A extends object, B extends object, R>(
  fn: (arg1: A, arg2: B) => R,
): (arg1: A, arg2: B) => R {
  const cache = new WeakMap<A, WeakMap<B, R>>();

  return (arg1: A, arg2: B): R => {
    let cacheForArg1 = cache.get(arg1);

    if (!cacheForArg1) {
      cacheForArg1 = new WeakMap<B, R>();
      cache.set(arg1, cacheForArg1);
    }

    const cached = cacheForArg1.get(arg2);
    if (cached !== undefined) return cached;

    const result = fn(arg1, arg2);
    cacheForArg1.set(arg2, result);
    return result;
  };
}

function memoizeLast(fn: Function) {
  let lastArgs: any[] | null = null;
  let lastResult: any;

  return function (...args: any[]) {
    if (
      lastArgs &&
      args.length === lastArgs.length &&
      args.every((arg, i) => lastArgs && Object.is(arg, lastArgs[i]))
    ) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  };
}

export const Lib = {
  parseXYZ,
  clamp,
  memoize1,
  memoize2,
  isKeyPressed,
  lerp,
  inverseLerp,
  memoizeLast,
};
