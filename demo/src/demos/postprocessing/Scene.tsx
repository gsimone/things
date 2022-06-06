import { Canvas, useFrame, useThree } from "@react-three/fiber";

import {
  Environment,
  OrbitControls,
  useEnvironment,
  useTexture,
} from "@react-three/drei";

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  DepthDownsamplingPass,
  NormalPass,
  BlendFunction,
  NoiseEffect,
  DepthPass,
  TextureEffect,
} from "postprocessing";
import { Suspense, useLayoutEffect, useRef } from "react";

import { CustomEffect, MipFog, NiceHaloThing, SamplerFog } from "@gsimone/postprocessing";
import { Color, LinearMipmapLinearFilter, RepeatWrapping } from "three";
import * as THREE from "three";
import { useControls } from "leva";

function Things() {
  return (
    <>
      {Array.from({ length: 1_000 }).map((_, i) => {
        const x = 1000;
        const h = Math.random() * 40 + 300;

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
                <cylinderGeometry args={[3, 3, h, 32]} />
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

function Post() {
  const { gl, scene, camera } = useThree();

  const $composer = useRef<EffectComposer>(null!);
  const $myEffect = useRef<CustomEffect>(null!);

  const fogEnv = useEnvironment({
    files: "forest-small.hdr",
  });

  const fogRamp = useTexture('./14956.png')



  useLayoutEffect(() => {
    fogRamp.magFilter = LinearMipmapLinearFilter;
    fogRamp.minFilter = LinearMipmapLinearFilter;
    fogRamp.anisotropy  = 10
  
    fogEnv.generateMipmaps = true;
    fogEnv.needsUpdate = true;
    fogEnv.magFilter = THREE.LinearMipmapLinearFilter;
    fogEnv.minFilter = THREE.LinearMipmapLinearFilter;
    fogEnv.wrapS = fogEnv.wrapT = RepeatWrapping;
    
    const composer = new EffectComposer(gl, {
      multisampling: 0,
      depthBuffer: true,
    });
    const depthpass = new DepthPass(scene, camera);
    const normalpass = new NormalPass(scene, camera);
    const depthdownpass = new DepthDownsamplingPass({ resolutionScale: 1. });

    const noiseEffect = new NoiseEffect({
      blendFunction: BlendFunction.SCREEN,
    });
    noiseEffect.blendMode.opacity.value = 0.05;

    const myEffect = new CustomEffect(camera);
    $myEffect.current = myEffect;

    const mipFog = new MipFog(camera, {
      fogEnv,
    });

    const niceHaloThing = new NiceHaloThing();

    const tt = new TextureEffect({
      texture: fogEnv,
    });

    const samplerFog = new SamplerFog(camera, {
      fogRamp: fogRamp
    })

    composer.addPass(new RenderPass(scene, camera));
    // composer.addPass(normalpass);
    // composer.addPass(depthdownpass);
    composer.addPass(new DepthPass(scene, camera));
    composer.addPass(new EffectPass(camera, mipFog));

    $composer.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, fogEnv]);

  useFrame(() => {
    $composer.current?.render();
  }, 1);

  // useControls({
  //   fogHeight: {
  //     value: 11,
  //     min: 0,
  //     max: 100,
  //     onChange: (v) => {
  //       $myEffect.current.uniforms.get("fogHeight")!.value = v;
  //     },
  //   },
  //   fogOffset: {
  //     value: 0,
  //     min: -1_000,
  //     max: 1_000,
  //     onChange: (v) => {
  //       $myEffect.current.uniforms.get("fogOffset")!.value = v;
  //     },
  //   },
  //   fogColor: {
  //     value: "#e8bb82",
  //     onChange: (v) => {
  //       $myEffect.current.uniforms.get("fogColor")!.value = new Color(v);
  //     },
  //   },
  //   fogColor2: {
  //     value: "#d50048",
  //     onChange: (v) => {
  //       $myEffect.current.uniforms.get("fogColor2")!.value = new Color(v);
  //     },
  //   },
  //   fogAlpha: {
  //     value: 1,
  //     min: 0,
  //     max: 1,
  //     step: 0.01,
  //     onChange: (v) => {
  //       $myEffect.current.uniforms.get("fogAlpha")!.value = v;
  //     },
  //   },
  // });

  return null;
}

function App() {
  return (
    <Canvas
      dpr={2}
      flat
      linear
      shadows
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false,
      }}
      camera={{
        position: [0, 20, 40],
        near: 0.1,
        far: 1000,
      }}
    >
      <Suspense fallback={null}>
        <Post />
        <Things />

        {/* <mesh>
          <planeGeometry args={[10, 20]} />
          <meshBasicMaterial color="white" />
        </mesh> */}

      </Suspense>

      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 0, 0]} intensity={1} />

      <OrbitControls />

      <color args={["#080406"]} attach="background" />
    </Canvas>
  );
}

export default App;
