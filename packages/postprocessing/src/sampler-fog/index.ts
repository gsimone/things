import { Color, Matrix4, Texture, Uniform, Vector3 } from "three";
import {
  BlendFunction,
  Effect,
  EffectAttribute,
  Resolution,
} from "postprocessing";

import { frag } from "./shader.frag.js";

export class SamplerFog extends Effect {
  constructor(
    camera,
    {
      width = Resolution.AUTO_SIZE,
      height = Resolution.AUTO_SIZE,
      resolutionScale = .1,
      fogRamp = new Texture()
    } = {}
  ) {
    super("CustomEffect", frag, {
      blendFunction: BlendFunction.ALPHA,
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map([
        ["inverseProjectionMatrix", new Uniform(new Matrix4())],
        ["projectionMatrix", new Uniform(new Matrix4())],
        ["viewMatrix", new Uniform(new Matrix4())],
        ["inverseViewMatrix", new Uniform(new Matrix4())],
        ["fogAlpha", new Uniform(1)],
        /**
         * New
         */
        ["fogRamp", new Uniform(fogRamp)]
      ]),
    });

    /**
     * The main camera.
     *
     * @type {Camera}
     * @private
     */

    this.camera = camera;

    /**
     * The resolution.
     *
     * @type {Resolution}
     */

    const resolution = (this.resolution = new Resolution(
      this,
      width,
      height,
      resolutionScale
    ));
    resolution.addEventListener("change", (e) =>
      this.setSize(resolution.baseWidth, resolution.baseHeight)
    );

  }

  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);

    this.adoptCameraSettings(this.camera);
  }

  adoptCameraSettings(camera) {
    this.uniforms.get("projectionMatrix").value.copy(camera.projectionMatrix);

    this.uniforms
      .get("inverseProjectionMatrix")
      .value.copy(camera.projectionMatrix)
      .invert();

    this.uniforms
      .get("viewMatrix")
      ?.value.copy(camera.matrixWorldInverse)

    this.uniforms
      .get("inverseViewMatrix")
      ?.value.copy(camera.matrixWorldInverse)
      .invert();
  }

  update() {
    const camera = this.camera

    this.uniforms
      .get("viewMatrix")
      ?.value.copy(camera.matrixWorldInverse)

    this.uniforms
      .get("inverseViewMatrix")
      ?.value.copy(camera.matrixWorldInverse)
      .invert();
  }

  dispose() {
    super.dispose();
  }
}

export default SamplerFog;
