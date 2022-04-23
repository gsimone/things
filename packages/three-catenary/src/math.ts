import { Vector3 } from "three";

const coth = (x: number) => 1 / Math.tanh(x);

const getRightTerm = (a: number, h: number) => 2 * a * Math.sinh(h / (2 * a));

const getRoughA = (l: number, h: number, v: number) => {
  const intervalStep = 1;
  const leftTerm = Math.sqrt(l * l - v * v);

  let a = 0;
  let i = 0;
  do {
    a += intervalStep;
    i++;
  } while (leftTerm < getRightTerm(a, h) && i < 1_00);

  return a;
};

const getApproximateA = (l: number, h: number, v: number) => {
  const leftTerm = Math.sqrt(l * l - v * v);

  const intervalStep = 1;
  let a = getRoughA(l, h, v);

  let a_prev = a - intervalStep;
  let a_next = a;

  const precision = 0.001;

  let i = 0;
  do {
    a = (a_prev + a_next) / 2;

    if (leftTerm < getRightTerm(a, h)) {
      a_prev = a;
    } else {
      a_next = a;
    }

    i++;
  } while (a_next - a_prev > precision && i < 1_00);

  return a;
};

export const getCatenaryPoint = (pa: Vector3, pb: Vector3, l = 4) => {
  let [x1, y1] = pa;
  let [x2, y2] = pb;

  const h = x2 - x1;
  const v = y2 - y1;

  const a = getApproximateA(l, h, v);

  const p = (x1 + x2 - a * Math.log((l + v) / (l - v))) / 2;
  const q = (y1 + y2 - l * coth(h / (2 * a))) / 2;

  return (x: number) => a * Math.cosh((x - p) / a) + q;
};
