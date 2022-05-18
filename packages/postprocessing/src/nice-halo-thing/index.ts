import { Color, CubeTexture, LinearFilter, Matrix4, Texture, Uniform, Vector3, WebGLRenderTarget } from "three";
import {
  BlendFunction,
  Effect,
  EffectAttribute,
  KawaseBlurPass,
  KernelSize,
  Resolution,
} from "postprocessing";

import { frag } from "./shader.frag.js";

export class NiceHaloThing extends Effect {
  constructor({
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionScale = 1,
  } = {}) {
    super("NiceHaloThing", frag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ["map", new Uniform(null)],
      ])
    });

       /**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "Blur.Target";
		this.renderTarget.texture.generateMipmaps = false;
 
    this.blurPass = new KawaseBlurPass({
      resolutionScale,
      width,
      height,
      kernelSize: KernelSize.MEDIUM,
    });

    const resolution = this.blurPass.getResolution();
    resolution.addEventListener("change", () =>
      this.setSize(resolution.baseWidth, resolution.baseHeight)
    );
  }

  setSize(width, height) {
    const resolution = this.blurPass.getResolution();
    resolution.setBaseSize(width, height);
  }

  get texture() {
		return this.renderTarget.texture;
	}

  getTexture() {
    return this.renderTarget.texture;
  }

  update(renderer, inputBuffer, deltaTime) {
    this.blurPass.render(renderer, inputBuffer, this.renderTarget)
  }

  dispose() {
    super.dispose();
  }
}

export default NiceHaloThing;
