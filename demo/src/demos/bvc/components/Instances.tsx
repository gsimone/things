import { Plane } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";

import { createClippedFlipbook } from "@gsimone/bvc";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  DataTexture,
  InstancedMesh,
  MultiplyBlending,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Texture,
  Vector3,
} from "three";

import * as random from "maath/random";

import { useClippedFlipbook } from "./Flipbook";
import { materialKey } from "../materials";

type Props = {
  map: Texture;
  showPolygon: boolean;
  vertices: number;
  horizontalSlices: number;
  verticalSlices: number;
  alphaThreshold: number;
};

export function MyInstances(props: Props) {
  const { map, vertices, horizontalSlices, verticalSlices, alphaThreshold } =
    props;

  const [geometry, dataTexture] = useClippedFlipbook(
    map.image,
    vertices,
    horizontalSlices,
    verticalSlices,
    alphaThreshold
  );

  const $mat = useRef();

  const $instancedMesh = useRef<InstancedMesh>();

  const count = 300;
  const points = random.inSphere(new Float32Array(count * 3), {
    radius: 0.5,
  }) as Float32Array;

  useLayoutEffect(() => {
    const dummy = new Object3D();
    if ($instancedMesh.current) {
      for (let i = 0; i < points.length; i += 3) {
        const [x, y, z] = points.slice(i * 3, i * 3 + 3);
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        $instancedMesh.current.setMatrixAt(i, dummy.matrix);
      }

      $instancedMesh.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if ($mat.current) {
      $mat.current.uniforms.u_index.value =
        Math.floor(t * 60) % (horizontalSlices * verticalSlices);
    }
  });

  return (
    <instancedMesh
      ref={$instancedMesh}
      geometry={geometry}
      args={[undefined, undefined, count]}
    >
      <myMaterial
        ref={$mat}
        key={materialKey}
        blending={NormalBlending}
        depthWrite={false}
        u_data={dataTexture}
        u_horizontalSlices={horizontalSlices}
        u_map={map}
        u_verticalSlices={verticalSlices}
        transparent
      />
    </instancedMesh>
  );
}
