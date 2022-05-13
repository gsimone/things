import "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { MutableRefObject, useMemo } from "react";
import { DepthTexture, UnsignedInt248Type, WebGLRenderTarget } from "three";
import { useRef } from "react";

const makeTexture = (w: number, h: number) => {
  const t = new DepthTexture(w, h);
  t.type = UnsignedInt248Type;

  return t;
};

type UseDepthBuffer = (
  { size }: { size: number | number[] },
  priority: number
) => MutableRefObject<WebGLRenderTarget>;

const useDepthFBORef = (w: number, h: number) => {
  const config = useMemo(
    () => ({
      depthTexture: makeTexture(w, h),
    }),
    []
  );
  const fbo = useFBO(w, h, config);
  const $fboRef = useRef(fbo);

  return $fboRef;
};

export const useDepthFBO: UseDepthBuffer = ({ size }, priority = 1) => {
  const w = typeof size === "object" ? size[0] : size;
  const h = typeof size === "object" ? size[1] : size;

  const $writeFbo = useDepthFBORef(w, h);
  const $readFbo = useDepthFBORef(w, h);

  useFrame((state) => {
    state.gl.clearDepth();
    state.gl.setRenderTarget($writeFbo.current);
    state.gl.render(state.scene, state.camera);

    const t = $writeFbo.current;
    $writeFbo.current = $readFbo.current;
    $readFbo.current = t;
  }, priority);

  return $readFbo;
};
