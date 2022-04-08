export class SmoothDamp {
  currentVelocity: number = 0;

  constructor(public smoothTime: number = 1, public maxSpeed: number = 1) {}

  get(current: number, target: number, deltaTime: number) {
    // Based on Game Programming Gems 4 Chapter 1.10
    this.smoothTime = Math.max(0.0001, this.smoothTime);
    const omega = 2 / this.smoothTime;

    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    const originalTo = target;

    // Clamp maximum speed
    const maxChange = this.maxSpeed * this.smoothTime;
    change = Math.min(Math.max(change, -maxChange), maxChange);
    target = current - change;

    const temp = (this.currentVelocity + omega * change) * deltaTime;
    this.currentVelocity = (this.currentVelocity - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 === output > originalTo) {
      output = originalTo;
      this.currentVelocity = (output - originalTo) / deltaTime;
    }

    return output;
  }
}
