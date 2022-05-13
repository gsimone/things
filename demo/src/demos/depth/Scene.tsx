import { Canvas, useThree } from "@react-three/fiber";

// import { Environment, OrbitControls } from "@react-three/drei";

// import { useDepthFBO } from "@gsimone/r3f-use-depth-fbo";

// import { key } from "./material";
import { Suspense, useRef } from "react";
// import { BackSide, DoubleSide } from "three";
import { useControls } from "leva";
import { Color, DebugLayerMaterial, LayerMaterial } from "lamina";
// import { extend } from "@react-three/fiber";


function App() {
  return (
    <Canvas camera={{ position: [10, 70, 100], fov: 60, near: 0.1, far: 400 }}>
      <mesh>
        <boxGeometry />
        <LayerMaterial />
      </mesh>


    </Canvas>
  );
}

export default App;
