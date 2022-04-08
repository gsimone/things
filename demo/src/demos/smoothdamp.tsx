import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { DoubleSide, MathUtils, Mesh, Vector3 } from "three";

import { SmoothDampVectors } from "@gsimone/smoothdamp/three";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

const _v = new Vector3();
const cameraNDCToWorld = (
  camera: THREE.Camera,
  pointer: { x: number; y: number },
  dest = new Vector3()
) => {
  _v.set(pointer.x, pointer.y, 0);
  _v.unproject(camera);
  _v.sub(camera.position).normalize();

  var distance = -camera.position.z / _v.z;
  dest.copy(camera.position).add(_v.multiplyScalar(distance));

  return dest
};

const SmoothElement = () => {
  const $ref = useRef<Mesh>(null!);
  const [smoothDampV] = useState(() => new SmoothDampVectors(0.3, 100));

  useControls({
    smoothTime: {value:0.3, min: 0.001, max: 2, step: 0.01, onChange: v => smoothDampV.smoothTime = v},
    maxSpeed: {value:100, min: 0, max: 1000, step: 1, onChange: v => smoothDampV.maxSpeed = v},
  })

  const dest = new Vector3();
  useFrame(({ pointer, camera }, delta) => {
    cameraNDCToWorld(camera, pointer, dest);

    $ref.current.position.copy(
      smoothDampV.get($ref.current.position, dest, delta)
    );
  });

  return (
    <mesh ref={$ref} position-y={2}>
      <meshBasicMaterial side={DoubleSide} color="#0EEC82" />
      <sphereGeometry args={[.5, 32, 32]} />
    </mesh>
  );
};

const LerpElement = () => {
  const $ref = useRef<Mesh>(null!);

  const dest = new Vector3();
  useFrame(({ camera, pointer }) => {
    cameraNDCToWorld(camera, pointer, dest);

    $ref.current.position.lerpVectors(
      $ref.current.position,
      dest,
      0.1
    );
  });

  return (
    <mesh ref={$ref} position-y={-2}>
      <meshBasicMaterial side={DoubleSide} color="#ff005b" />
      <sphereGeometry args={[.5, 32, 32]} />
    </mesh>
  );
};

export default () => {
  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 10 }}>
      <SmoothElement />
      <LerpElement />
      <color attach="background" args={["#080406"]} />

      <OrbitControls />
    </Canvas>
  );
};
