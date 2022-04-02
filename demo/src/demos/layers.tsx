import { Canvas, useFrame } from "@react-three/fiber";

import { Layers } from "@gsimone/r3f-layers";
import {bitmask} from '@gsimone/leva-plugin-bitmask'
import { FC, useRef } from "react";
import { Mesh } from "three";
import { PerspectiveCamera } from "@react-three/drei";

import { useControls } from "leva";


const El: FC<{ layers: number[] | number }> = ({ layers, ...props }) => {
  const $mesh = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    $mesh.current.rotation.x = Math.sin(clock.getElapsedTime());
    $mesh.current.rotation.y = Math.cos(clock.getElapsedTime() * 3);
    $mesh.current.rotation.z = Math.sin(clock.getElapsedTime());
  });

  return (
    <mesh ref={$mesh} {...props}>
      <Layers layers={layers} />

      <capsuleGeometry args={[1, 1, 1]} />
      <meshNormalMaterial wireframe />
    </mesh>
  );
};



function App() {
  const { layers } = useControls({
    layers: bitmask({
      size: 8,
      value: [1, 1]
    }),
  });
  return (
    <Canvas>
      <El layers={[0]} position-x={-4} />
      <El layers={[0, 1]} />
      <El layers={2} position-x={4} />

      <PerspectiveCamera makeDefault position={[0, 0, 10]}>
        <Layers layers={layers.layersArray} />
      </PerspectiveCamera>

      <color attach="background" args={["#080406"]} />
    </Canvas>
  );
}

export default App;
