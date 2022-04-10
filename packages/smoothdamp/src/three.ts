import { Vector3 } from "three";
import { SmoothDamp } from ".";

export class SmoothDampVectors {
  _v = new Vector3();

  dampers: SmoothDamp[] = [];

  constructor(smoothTime: number = 1,maxSpeed: number = 1) {
    this.dampers = [
      new SmoothDamp(smoothTime, maxSpeed),
      new SmoothDamp(smoothTime, maxSpeed),
      new SmoothDamp(smoothTime, maxSpeed),
    ];
  }

  set smoothTime(value: number) {
    this.dampers.forEach((d) => (d.smoothTime = value));
  }

  set maxSpeed(value: number) {
    this.dampers.forEach((d) => (d.maxSpeed = value));
  }

  get(current: Vector3, target: Vector3, deltaTime: number) {
    this._v.x = this.dampers[0].get(current.x, target.x, deltaTime);
    this._v.y = this.dampers[1].get(current.y, target.y, deltaTime);
    this._v.z = this.dampers[2].get(current.z, target.z, deltaTime);

    return this._v;
  }

}
