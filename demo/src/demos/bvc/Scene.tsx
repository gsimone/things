import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";

import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Suspense, useCallback, useState } from "react";
import { useControls } from "leva";
import { extend } from "@react-three/fiber";

import { ClippedSpriteGeometry, ClippedFlipbookGeometry } from "@gsimone/bvc";
import "./materials";
import { MyFlipbook } from "./components/Flipbook";
import { MyInstances } from "./components/Instances";

import {Perf} from 'r3f-perf'

const MyUVsMaterial = shaderMaterial(
  {},
  /* glsl */ `
  varying vec2 vUv; 

  void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  /* glsl */ `
  varying vec2 vUv;

  void main () {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`
);

const MyBillboardMaterial = shaderMaterial(
  {
    map: null,
  },
  /* glsl */ `
  varying vec2 vUv; 

  vec3 billboard(vec2 v, mat4 view){
    vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
    vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 p = right * v.x + up * v.y;
    return p;
  }

  void main () {
    vUv = uv;

    vec3 transformed = position;

    transformed = billboard(transformed.xy, viewMatrix);

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
  }
`,
  /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D map;

  void main () {
    vec4 col = texture2D(map, vUv);
    gl_FragColor = vec4(col);
  }
`
);

extend({
  MyUVsMaterial,
  MyBillboardMaterial,
  ClippedSpriteGeometry,
  ClippedFlipbookGeometry,
});

function Instanced() {
  // const $instancedMesh = useRef<InstancedMesh>();

  // const count = 300_000;
  // const points: Float32Array = random.inSphere(new Float32Array(count * 3), {
  //   radius: 40,
  // });

  // useLayoutEffect(() => {
  //   const dummy = new Object3D();
  //   if ($instancedMesh.current) {
  //     for (let i = 0; i < points.length; i += 3) {
  //       const [x, y, z] = points.slice(i * 3, i * 3 + 3);
  //       dummy.position.set(x, y, z);

  //       dummy.updateMatrix();
  //       $instancedMesh.current.setMatrixAt(i, dummy.matrix);
  //     }

  //     $instancedMesh.current.instanceMatrix.needsUpdate = true;
  //   }
  // }, []);

  return (
    <>
      {/* <instancedMesh args={[null, null, count]} ref={$instancedMesh}>
        <clippedSpriteGeometry
          args={[map.image, vertices, { alphaThreshold }]}
        />
        <myBillboardMaterial
          map={map}
          alphaMap={map}
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </instancedMesh> */}
    </>
  );
}

function MyScene({ img }) {
  const controls = useControls({
    alphaThreshold: { value: 0, min: 0, max: 1, step: 0.001 },
    horizontalSlices: { min: 0, max: 20, step: 1, value: 8 },
    verticalSlices: { min: 0, max: 20, step: 1, value: 8 },
    showPolygon: true,
  });

  const map = useTexture(img || "/assets/splos.png");

  return (
    <>
      <MyInstances map={map} vertices={8} {...controls} />
      {/* <MyFlipbook map={map} vertices={8} {...controls} /> */}
      {/* <MySprite map={map} position-x={-8} vertices={4} {...controls} /> */}
      {/* <MySprite map={map} vertices={6} {...controls} /> */}
      {/* <MySprite map={map} position-x={8} vertices={8} {...controls} /> */}
    </>
  );
}

export default () => {
  const [img, setImg] = useState();
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        setImg(binaryStr);
      };

      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      // {...getRootProps()}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* <input {...getInputProps()} /> */}
      <Canvas camera={{ position: [0, 0, 5], zoom: 65 }} orthographic dpr={2}>
        <Suspense fallback={null}>
          <MyScene img={img} />

          <color attach="background" args={["#666"]} />
          <axesHelper />
          <OrbitControls />
          
          <Perf position="bottom-right" />
        </Suspense>
      </Canvas>
    </div>
  );
};
