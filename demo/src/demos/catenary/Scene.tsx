import { Canvas, useFrame } from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import { useControls } from "leva";
import { CatenaryCurve } from "@gsimone/three-catenary";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  TubeGeometry,
  Vector3,
} from "three";
import { MutableRefObject, useRef } from "react";

function Catenary({ p1, p2 }: { p1: Vector3; p2: Vector3 }) {
  const { l } = useControls({
    l: {
      min: 0,
      max: 20,
      value: 10.6,
    },
  });
  const $b = useRef<BufferGeometry>();
  const $tube = useRef<Mesh>();

  useFrame(() => {
    const catenary = new CatenaryCurve(p1, p2, l);

    const points = catenary.getArray(20);

    if ($b.current) {
      $b.current.setAttribute("position", new BufferAttribute(points, 3));
    }

    if ($tube.current) {
      $tube.current.geometry = new TubeGeometry(catenary, 100, 0.1, 10, false);
    }
  });

  return (
    <>
      <mesh ref={$tube}>
        <meshNormalMaterial />
      </mesh>

      <line>
        <bufferGeometry ref={$b} />
        <lineBasicMaterial />
      </line>
      <Point positionRef={{ current: p1 }} />
      <Point positionRef={{ current: p2 }} />
    </>
  );
}

function Point({ positionRef }: { positionRef: MutableRefObject<Vector3> }) {
  const ref = useRef<Mesh>();

  useFrame(() => {
    ref.current?.position.copy(positionRef.current);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial />
    </mesh>
  );
}
function App() {
  return (
    <Canvas
      dpr={2}
      gl={{ antialias: true }}
      orthographic
      camera={{ position: [0, 0, 100], zoom: 50 }}
    >
      <group position-y={-1}>
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(5, 6, 5)} />
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(-6.3, 0, 6)} />
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(-4, 0, -6)} />
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(7.5, 0, -6)} />
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(3, 4, -7)} />
        <Catenary p1={new Vector3(0, 3, 0)} p2={new Vector3(-8, 4, -6)} />
      </group>

      <OrbitControls />

      <color args={["#080406"]} attach="background" />
      <axesHelper />

      {/* <gridHelper rotation-x={Math.PI / 2} args={[10, 10, "#333", "#333"]} /> */}
    </Canvas>
  );
}

export default App;
