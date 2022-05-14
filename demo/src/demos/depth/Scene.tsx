import { Canvas, useThree } from "@react-three/fiber";

import { Environment, OrbitControls } from "@react-three/drei";

import { useDepthFBO } from "@gsimone/r3f-use-depth-fbo";

import { key, MyLayer, MyMaterial } from "./material";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { BackSide, DoubleSide } from "three";
import { useControls } from "leva";
import { Color, DebugLayerMaterial, LayerMaterial } from "lamina";
import { extend } from "@react-three/fiber";

extend({ MyLayer, MyMaterial });

function Things() {
  return (
    <>
      {Array.from({ length: 1_000 }).map((_, i) => {
        const x = 300;
        const h = Math.random() * 30;

        return (
          <>
            <group
              key={i}
              position={[
                Math.random() * x - x / 2,
                h / 2,
                Math.random() * x - x / 2,
              ]}
            >
              <mesh position-y={0}>
                <boxGeometry args={[3, h, 3]} />
                <meshPhysicalMaterial color="#111" />
              </mesh>
            </group>
          </>
        );
      })}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1_000, 1_000]} />
        <meshPhysicalMaterial color="#111" />
      </mesh>
    </>
  );
}

function MyThing() {
  const [$depthRef, swap] = useDepthFBO({
    size: 1024,
  });

  const $debugMaterial = useRef();
  const $layer = useRef();

  useFrame(({ gl, camera, scene }) => {
    gl.setRenderTarget($depthRef.current);
    gl.render(scene, camera);
    
    if ($layer.current) {
      $layer.current.u_depth_fbo = $depthRef.current.depthTexture;
    }
    
    if ($debugMaterial.current) {
      $debugMaterial.current.uniforms.u_depth_fbo.value =
      $depthRef.current.depthTexture;
    }
    
    swap();
    
    // render main scene
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, -1);

  const camera = useThree((s) => s.camera);

  return (
    <>
      {/* <mesh rotation-x={-Math.PI / 2} position-y={10} renderOrder={-1000}>
        <planeGeometry args={[2_000, 2_000]} />
        <LayerMaterial
          lighting="basic"
          key={key}
          transparent
          depthWrite={false}
        >
          <myLayer
            u_color="blue"
            ref={$layer}
            u_cameraNear={camera.near}
            u_cameraFar={camera.far}
          />
        </LayerMaterial>
      </mesh> */}
      <mesh rotation-x={-Math.PI / 2} position-y={11}>
        <planeGeometry args={[300, 300]} />
        <myMaterial
          ref={$debugMaterial}
          transparent
          depthWrite={false}
          key={key}
          u_cameraNear={camera.near}
          u_cameraFar={camera.far}
        />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas camera={{ position: [10, 70, 100], fov: 60, near: 0.1, far: 400 }}>
      <fogExp2 attach={"fog"} density={0.004} color={"#000"} />

      <Things />
      <MyThing />

      <Suspense>
        <Environment preset="forest" />
      </Suspense>

      <color args={["#080406"]} attach="background" />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
