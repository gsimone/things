import {
  Curve,
  Float32BufferAttribute,
  MathUtils,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { getCatenaryPoint } from "./math";

const AXIS_X = new Vector3(1, 0, 0);

export class CatenaryCurve extends Curve {
  getCatenaryValue: (t: number) => number;
  _pa: Vector3;
  _pb: Vector3;

  angle: number;

  matrix: Matrix4;
  invertedMatrix: Matrix4;

  constructor(pa: Vector3, pb: Vector3, public l: number) {
    super();
    this.type = "CatenaryCurve";

    this._pa = pa.z < pb.z ? pa.clone() : pb.clone();
    this._pb = pa.z > pb.z ? pa.clone() : pb.clone();

    const distance = this._pa.distanceTo(this._pb);
    const dir = new Vector3().subVectors(this._pb, this._pa).normalize();

    this.angle = dir.angleTo(AXIS_X);

    const transformMatrix = new Matrix4();
    const tm1 = new Matrix4().makeTranslation(
      ...new Vector3().sub(this._pa).toArray()
    );
    const tm2 = new Matrix4().makeRotationY(this.angle);

    transformMatrix.multiply(tm1).multiply(tm2);

    this._pa.applyMatrix4(transformMatrix);
    this._pb.applyMatrix4(transformMatrix);

    this.getCatenaryValue = getCatenaryPoint(
      this._pa,
      this._pb,
      Math.max(this.l, distance)
    );

    this.matrix = transformMatrix;
    this.invertedMatrix = transformMatrix.invert();
  }

  getPoint(t: number, optionalTarget = new Vector3()) {
    const p = MathUtils.lerp(this._pa.x, this._pb.x, t);
    const py = this.getCatenaryValue(p);
    const pz = MathUtils.lerp(this._pa.z, this._pb.z, t);

    return optionalTarget.set(p, py, pz).applyMatrix4(this.invertedMatrix);
  }

  getPoints(N: number): Float32Array {
    const points = new Float32BufferAttribute(N * 3, 3, false);
    for (let i = 1; i < N - 1; i++) {
      const t = i / N;
      const p = MathUtils.lerp(this._pa.x, this._pb.x, t);
      const pz = MathUtils.lerp(this._pa.z, this._pb.z, t);

      points.setXYZ(i, p, this.getCatenaryValue(p), pz);
    }

    points.setXYZ(0, ...this._pa.toArray());
    points.setXYZ(N - 1, ...this._pb.toArray());

    points.applyMatrix4(this.invertedMatrix);

    return points.array as Float32Array;
  }
}
