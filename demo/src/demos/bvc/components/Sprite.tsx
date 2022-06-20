import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";

import {
  Bounds,
  Edges,
  OrbitControls,
  Plane,
  shaderMaterial,
  Text,
  useTexture,
} from "@react-three/drei";
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControls } from "leva";
import { BufferGeometry, InstancedMesh, NormalBlending, Object3D } from "three";
import { extend } from "@react-three/fiber";

import * as random from "maath/random";

import {
  ClippedSpriteGeometry,
  ClippedFlipbookGeometry,
  ClippedFlipbookDataTexture,
} from "@gsimone/bvc";

function MySprite({ map, showPolygon, index, vertices, ...props }) {
  const ref = useRef<BufferGeometry>(null!);
  const [reduction, setReduction] = useState(0);

  const horizontalIndex = index % props.horizontalSlices;
  const verticalIndex = Math.floor(index / props.horizontalSlices);

  useLayoutEffect(() => {
    setReduction(-Math.floor(ref.current.userData.reduction * 100));
  }, [
    map,
    index,
    vertices,
    setReduction,
    props.alphaThreshold,
    props.horizontalIndex,
    props.verticalIndex,
  ]);

  return (
    <group {...props}>
      <Plane scale={6}>
        <meshBasicMaterial wireframe transparent opacity={0.125} />
      </Plane>

      <mesh scale={6}>
        <clippedSpriteGeometry
          ref={ref}
          args={[
            map.image,
            vertices,
            { ...props, horizontalIndex, verticalIndex },
          ]}
        />
        <meshBasicMaterial map={map} transparent />
      </mesh>

      <mesh scale={6} visible={showPolygon}>
        <clippedSpriteGeometry
          args={[
            map.image,
            vertices,
            { ...props, horizontalIndex, verticalIndex },
          ]}
        />
        <meshBasicMaterial wireframe transparent />
      </mesh>
      <Text
        fontSize={0.2}
        position-y={-3.25}
        position-x={3}
        anchorX="right"
        anchorY="top"
      >
        {reduction}%
      </Text>
    </group>
  );
}