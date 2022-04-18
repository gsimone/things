import { Canvas, useFrame } from "@react-three/fiber";

import { Layers } from "@gsimone/r3f-layers";
import { bitmask } from "@gsimone/leva-plugin-bitmask";
import { FC, useRef, useState } from "react";
import { DoubleSide, Mesh, Raycaster, Vector3 } from "three";
import { OrbitControls, PerspectiveCamera, useHelper } from "@react-three/drei";

import { useControls } from "leva";
import { RaycasterHelper } from "@gsimone/three-raycaster-helper";

const El: FC<{ layers: number[] | number }> = ({ layers, ...props }) => {
  const $mesh = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    $mesh.current.position.y = Math.sin(clock.getElapsedTime() * .5 + $mesh.current.position.x);
    $mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * .5) * Math.PI * 1;
  });

  return (
    <mesh ref={$mesh} {...props}>
      <Layers layers={layers} />

      <capsuleGeometry args={[0.5, 0.5, 4, 32]} />
      <meshNormalMaterial side={DoubleSide} />
    </mesh>
  );
};

const Ray: FC<{ layers: number[] }> = ({ layers }) => {
  const [r] = useState(
    () => new Raycaster(new Vector3(-4, 0, 0), new Vector3(1, 0, 0))
  );

  const helper = useHelper({ current: r }, RaycasterHelper);

  useFrame(({ scene, clock }) => {
    r.ray.origin.y = Math.sin(clock.getElapsedTime()) * 2
    helper.current.hits = r.intersectObjects(scene.children);
  });

  useControls({
    nearfar: {
      value:[ 1, 8],
      onChange: ([n, F]) => {
        console.log(n,F)
        r.near = n
        r.far = F
      },
      min: 0.01,
      max: 20
    },
    
  })

  return (
    <primitive object={r} far={8} near={0.01}>
      <Layers layers={layers} />
    </primitive>
  );
};

function App() {
  const { layers, rayLayers } = useControls("Layers", {
    layers: bitmask({
      size: 8,
      value: 3,
      label: "Camera",
    }),
    rayLayers: bitmask({
      size: 8,
      value: [1, 1, 1],
      label: "Ray",
    }),
  });

  return (
    <Canvas>
      <Ray layers={rayLayers.layersArray} />

      <El layers={[0]} position-x={-2} />
      <El layers={[1]} />
      <El layers={2} position-x={2} />

      <PerspectiveCamera makeDefault position={[0, 0, 10]}>
        <Layers layers={layers.layersArray} />
      </PerspectiveCamera>

      <color attach="background" args={["#080406"]} />

      <OrbitControls />
    </Canvas>
  );
}

export default App;
