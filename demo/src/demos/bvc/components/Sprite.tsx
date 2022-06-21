import { Billboard, Plane, Text } from "@react-three/drei";
import { useControls } from "leva";
import { useLayoutEffect, useRef, useState } from "react";
import { BufferGeometry } from "three";

export function MySprite({ map, vertices, scale, ...props }) {
  const ref = useRef<BufferGeometry>(null!);
  const [reduction, setReduction] = useState(0);

  const { index, showPolygon } = useControls(
    {
      index: {
        min: 0,
        value: 34,
        max: props.horizontalSlices * props.verticalSlices,
        step: 1,
      },
      showPolygon: false,
    },
    [props.horizontalSlices, props.verticalSlices]
  );

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
    scale
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
            { ...props, scale, horizontalIndex, verticalIndex },
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
            { ...props, scale, horizontalIndex, verticalIndex },
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
