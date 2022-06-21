import { Billboard, Plane, Text } from "@react-three/drei";
import { folder, useControls } from "leva";
import { useLayoutEffect, useRef, useState } from "react";
import { BufferGeometry } from "three";

export function MySprite({ map, index, vertices, showPolygon, ...props }) {
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
    horizontalIndex,
    verticalIndex,
  ]);

  return (
    <group {...props}>
      <Billboard>
        <Plane scale={6}>
          <meshBasicMaterial wireframe transparent opacity={0.125} />
        </Plane>
      </Billboard>

      <mesh scale={6}>
        <clippedSpriteGeometry
          ref={ref}
          args={[
            map.image,
            vertices,
            { ...props, horizontalIndex, verticalIndex },
          ]}
        />
        <myBillboardMaterial
          map={map}
          transparent
          alphaTest={props.alphaThreshold}
          alphaMap={map}
        />
      </mesh>

      <mesh scale={6} visible={showPolygon}>
        <clippedSpriteGeometry
          args={[
            map.image,
            vertices,
            { ...props, horizontalIndex, verticalIndex },
          ]}
        />
        <myUVsMaterial depthTest={false} wireframe transparent />
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
