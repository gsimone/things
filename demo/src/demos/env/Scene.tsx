import {
  Canvas,
  useFrame,
  createPortal,
  extend,
  useThree,
} from "@react-three/fiber";

import {
  EnvironmentCube,
  EnvironmentMap,
  OrbitControls,
  shaderMaterial,
  useEnvironment,
  useFBO,
} from "@react-three/drei";

import { useControls } from "leva";
import { CatenaryCurve } from "@gsimone/three-catenary";
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  EquirectangularReflectionMapping,
  Mesh,
  Scene,
  TubeGeometry,
  Vector3,
} from "three";
import {
  MutableRefObject,
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {detailedDiff} from 'deep-object-diff'

const MyShaderMaterial = shaderMaterial(
  {
    aMap: null,
    bMap: null,
    resolution: [512, 512],
    t: 0,
  },
  /*glsl*/ `
void main() {
  gl_Position = vec4(position.xy,  0., 1.);
}
`,
  /*glsl*/ `
  uniform vec2 resolution;
  uniform sampler2D aMap;
  uniform sampler2D bMap;
  uniform float t;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 a = texture2D(aMap, uv);
    vec4 b = texture2D(bMap, uv);

    vec3 color = vec3(0.);
    color = mix(a.rgb, b.rgb, t);
    
    gl_FragColor = vec4(color, 1.);
  }
`
);

extend({ MyShaderMaterial });

function MyEnv() {
  const a = useEnvironment({ preset: "forest" });
  const b = useEnvironment({ preset: "night" });

  const c = useFBO(512, 512);

  c.texture.name = "MyCustomEnv"
  c.texture.mapping = EquirectangularReflectionMapping;
  c.texture.isCubeTexture = true

  const [vscene] = useState(() => new Scene());
  const [vcam] = useState(() => new Camera());

  const $mat = useRef();

  useFrame(({ clock }) => {
    if ($mat.current) {
      $mat.current.t = Math.sin(clock.getElapsedTime());
    }
  });

  useFrame(({ gl }) => {
    gl.autoClear = false;
    
    gl.setRenderTarget(c);
    gl.render(vscene, vcam);
    gl.setRenderTarget(null);
    
    c.texture.needsPMREMUpdate = true;
    c.texture.needsUpdate = true;
  }, 3);


  useFrame(({gl,scene,camera}) => {
    gl.render(scene, camera)
  }, 1)

  return (
    <>
      <EnvironmentMap map={a} background />
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <myShaderMaterial ref={$mat} aMap={a} bMap={b} t={0.5} />
        </mesh>,
        vscene
      )}
    </>
  );
}

function App() {
  return (
    <Canvas dpr={2} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <MyEnv />
      </Suspense>

      <mesh>
        <torusGeometry />
        <meshPhysicalMaterial />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}

export default App;
