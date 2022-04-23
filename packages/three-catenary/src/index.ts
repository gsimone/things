import {
  Curve,
  Float32BufferAttribute,
  MathUtils,
  Matrix4,
  Vector3,
} from "three";
import { getCatenaryPoint } from "./math";

const AXIS_X = new Vector3(1, 0, 0);

/**
 * @todo add a way to change the math precisions - for both rough and binary search
 */
export class CatenaryCurve extends Curve<Vector3> {
  getCatenaryValue: (t: number) => number;
  _pa: Vector3;
  _pb: Vector3;

  angle: number;

  matrix: Matrix4;
  invertedMatrix: Matrix4;

  constructor(pa: Vector3, pb: Vector3, public l: number) {
    super();
    this.type = "CatenaryCurve";

    /**
     * The algorithm is simplified by transforming the points so that:
     * - the fist point is at origin
     * - the points are coplanar and on the XY plane
     *
     * NOTE: Points are sorted based on their z coordinate so that the first point always has a bigger z coord.
     * The algorithm still works and doesn't require any special treatment for the first point after this change.
     */
    this._pa = (pa.z < pb.z ? pa : pb).clone();
    this._pb = (pa.z > pb.z ? pa : pb).clone();

    const dir = new Vector3().subVectors(this._pb, this._pa).normalize();

    this.angle = dir.angleTo(AXIS_X);

    const transformMatrix = new Matrix4();

    /**
     * translate points so that the first one is at origin
     */
    const tm1 = new Matrix4().makeTranslation(...new Vector3().sub(this._pa));

    /**
     * Rotate points so that they lie on plane XY
     */
    const tm2 = new Matrix4().makeRotationY(this.angle);

    /**
     * Apply the transformation matrices to identity, getting the final transform matrix
     */
    transformMatrix.multiply(tm1).multiply(tm2);

    /**
     * Transform both points
     */
    this._pa.applyMatrix4(transformMatrix);
    this._pb.applyMatrix4(transformMatrix);

    /**
     * @todo maybe don't store the matrix, it's not really useful
     */
    this.matrix = transformMatrix;
    /**
     * The invert of the transformMatrix will be used to transform points back to world space
     */
    this.invertedMatrix = transformMatrix.invert();

    this.getCatenaryValue = getCatenaryPoint(
      this._pa,
      this._pb,
      Math.max(this.l, this._pa.distanceTo(this._pb))
    );
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

    /**
     * Apply inverted transform matrix to the points to get them in world space
     */
    points.applyMatrix4(this.invertedMatrix);

    return points.array as Float32Array;
  }
}
