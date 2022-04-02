import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, Mesh } from "three";

import { SmoothDamp } from "@gsimone/smoothdamp";

const SmoothElement = () => {
  const $ref = useRef<Mesh>(null!);
  const [smoothdamp] = useState(() => new SmoothDamp(0.3, 10));

  useFrame(({ clock }, delta) => {
    const x = Math.sin( clock.getElapsedTime() * 2 ) * 5
    $ref.current.position.x = smoothdamp.do($ref.current.position.x, x, delta);
  });

  return (
    <mesh ref={$ref} position-y={2}>
      <meshBasicMaterial color="#0EEC82" />
      <octahedronGeometry args={[1, 8]} />
    </mesh>
  );
};

const LerpElement = () => {
  const $ref = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    const x = Math.sin( clock.getElapsedTime() * 2 ) * 5

    $ref.current.position.x = MathUtils.lerp($ref.current.position.x, x, 0.1);
  });

  return (
    <mesh ref={$ref} position-y={-2}>
      <meshBasicMaterial color="#ff005b" />
      <octahedronGeometry args={[1, 8]} />
    </mesh>
  );
};

export default () => {
  return (
    <Canvas camera={{position: [0, 0, 10]}}>
      <SmoothElement />
      <LerpElement />
      <color attach="background" args={["#080406"]} />
    </Canvas>
  );
};
