import { Plane, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";

import { createClippedFlipbook } from "@gsimone/bvc";
import { materialKey } from "../materials";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DataTexture, Texture } from "three";

export function useClippedFlipbook(
  image: HTMLImageElement,
  vertices: number,
  horizontalSlices: number,
  verticalSlices: number,
  alphaThreshold: number
): [BufferGeometry, DataTexture] {
  return useMemo(() => {
    return createClippedFlipbook(
      image,
      vertices,
      horizontalSlices,
      verticalSlices,
      alphaThreshold
    );
  }, [image, vertices, horizontalSlices, verticalSlices, alphaThreshold]);
}

// format number to 2 decimal places
function format(number: number) {
  return Math.round(number * 100) / 100;
}

type MyFlipbookProps = {
  map: Texture;
  fps: number;
  showPolygon: boolean;
  vertices: number;
  horizontalSlices: number;
  verticalSlices: number;
  alphaThreshold: number;
};

export function MyFlipbook({
  map,
  fps = 30,
  showPolygon,
  vertices,
  horizontalSlices,
  verticalSlices,
  alphaThreshold,
  ...props
}: MyFlipbookProps) {
  const $mat = useRef();
  const $mat2 = useRef();

  const [geometry, dataTexture, _, savings] = useClippedFlipbook(
    map.image,
    vertices,
    horizontalSlices,
    verticalSlices,
    alphaThreshold
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if ($mat.current && $mat2.current) {
      $mat.current.uniforms.u_index.value =
        $mat2.current.uniforms.u_index.value =
          Math.floor(t * fps) % (horizontalSlices * verticalSlices);
    }
  });

  return (
    <group {...props}>
      <Plane scale={6}>
        <meshBasicMaterial wireframe transparent opacity={0.125} />
      </Plane>

      <mesh scale-y={-6} position-x={3.5}>
        <planeGeometry />
        <meshBasicMaterial map={dataTexture} color="white" />
      </mesh>

      <mesh
        scale={6.1}
        renderOrder={1}
        visible={showPolygon}
        geometry={geometry}
        position-z={0.1}
      >
        <myMaterial
          depthRead={false}
          key={materialKey}
          ref={$mat}
          u_data={dataTexture}
          u_debugUv={1}
          u_horizontalSlices={horizontalSlices}
          u_map={map}
          u_vertices={vertices}
          u_verticalSlices={verticalSlices}
          wireframe
        />
      </mesh>

      <mesh scale={6} geometry={geometry}>
        <myMaterial
          key={materialKey}
          ref={$mat2}
          transparent
          u_data={dataTexture}
          u_horizontalSlices={horizontalSlices}
          u_map={map}
          u_vertices={vertices}
          u_verticalSlices={verticalSlices}
        />
      </mesh>
      <Text
        fontSize={0.2}
        position-y={-3.25}
        position-x={3}
        anchorX="right"
        anchorY="top"
      >
        avg {format(savings.avg * 100)}% - min {format(savings.min * 100)}% - max {format(savings.max * 100)}%
      </Text>
    </group>
  );
}
