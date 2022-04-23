import { Vector3 } from "three";

const coth = (x: number) => 1 / Math.tanh(x);

const getRightTerm = (a: number, h: number) => 2 * a * Math.sinh(h / (2 * a));

/**
 * Roughly calculates the catenary's a parameter.
 */
const getRoughA = (l: number, h: number, v: number) => {
  const leftTerm = Math.sqrt(l * l - v * v);

  const INTERVAL_STEP = 1;
  const MAX_STEPS = 100;

  let a = 0;
  let i = 0;
  do {
    a += INTERVAL_STEP;
    i++;
  } while (leftTerm < getRightTerm(a, h) && i < MAX_STEPS);

  return a;
};

/**
 * Uses binary serach to find a good enough approximation for the catenary's a parameter.
 *
 * - get a rough estimate using @see getRoughA
 * - starting from the rough estimate, use binary search to find the best approximation
 *  - the best approximation is the one that minimizes the error
 *  - the error is the difference between the actual and the expected value
 * - the precision is the difference between the actual and the next best approximation, useful to end calculations early
 * - a max number of steps is used to avoid infinite loops
 */
const getApproximateA = (l: number, h: number, v: number) => {
  const leftTerm = Math.sqrt(l * l - v * v);

  const INTERVAL_STEP = 1;
  const MAX_STEPS = 100;
  const PRECISION = 0.001;

  let a = getRoughA(l, h, v);

  let a_prev = a - INTERVAL_STEP;
  let a_next = a;

  let i = 0;
  do {
    a = (a_prev + a_next) / 2;

    if (leftTerm < getRightTerm(a, h)) {
      a_prev = a;
    } else {
      a_next = a;
    }

    i++;
  } while (a_next - a_prev > PRECISION && i < MAX_STEPS);

  return a;
};

/**
 * Returns a function of x that approximates the catenary's y value for given points and total length.
 */
export const getCatenaryPoint = (pa: Vector3, pb: Vector3, l = 4) => {
  // @ts-ignore
  const [x1, y1] = pa;
  // @ts-ignore
  const [x2, y2] = pb;

  const h = x2 - x1;
  const v = y2 - y1;

  const a = getApproximateA(l, h, v);

  const p = (x1 + x2 - a * Math.log((l + v) / (l - v))) / 2;
  const q = (y1 + y2 - l * coth(h / (2 * a))) / 2;

  return (x: number) => a * Math.cosh((x - p) / a) + q;
};
