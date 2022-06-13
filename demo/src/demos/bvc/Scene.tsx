import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";

import {
  Bounds,
  Edges,
  OrbitControls,
  Plane,
  shaderMaterial,
  Text,
  useTexture,
} from "@react-three/drei";
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useControls } from "leva";
import { BufferGeometry, InstancedMesh, NormalBlending, Object3D } from "three";
import { extend } from "@react-three/fiber";

import * as random from "maath/random";

import { ClippedSpriteGeometry } from "@gsimone/bvc";

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

extend({ MyUVsMaterial, MyBillboardMaterial, ClippedSpriteGeometry });

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

function MySprite({ map, alphaThreshold, showPolygon, vertices, ...props }) {
  const ref = useRef<BufferGeometry>(null!);
  const [reduction, setReduction] = useState(0);

  useLayoutEffect(() => {
    setReduction(-Math.floor(ref.current.userData.reduction * 100));
  }, [map, vertices, setReduction, alphaThreshold]);

  return (
    <group {...props}>
      <Plane scale={6}>
        <meshBasicMaterial wireframe transparent opacity={0.125} />
      </Plane>

      <mesh scale={6}>
        <clippedSpriteGeometry
          ref={ref}
          args={[map.image, vertices, { alphaThreshold }]}
        />
        <meshBasicMaterial map={map} transparent />
      </mesh>

      <mesh scale={6} visible={showPolygon}>
        <clippedSpriteGeometry
          args={[map.image, vertices, { alphaThreshold }]}
        />
        <meshBasicMaterial wireframe transparent />
      </mesh>
      <Text
        fontSize={0.2}
        position-y={-3.25}
        position-x={3}
        anchorX="right"
        anchorY="top"
      >
        {reduction}%
      </Text>
    </group>
  );
}

function MyScene({ img }) {
  const { alphaThreshold, showPolygon, horizontal, vertical } = useControls({
    alphaThreshold: { value: 0.15, min: 0, max: 1, step: 0.001 },
    horizontal: 4,
    vertical: 4,
    showPolygon: true,
  });

  const map = useTexture(img || "/assets/smoke.png");

  return (
    <>
      <MySprite
        alphaThreshold={alphaThreshold}
        map={map}
        position-x={-8}
        showPolygon={showPolygon}
        vertices={4}
      />

      <MySprite
        alphaThreshold={alphaThreshold}
        map={map}
        showPolygon={showPolygon}
        vertices={6}
      />

      <MySprite
        alphaThreshold={alphaThreshold}
        map={map}
        position-x={8}
        showPolygon={showPolygon}
        vertices={8}
      />
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
      {...getRootProps()}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <input {...getInputProps()} />
      <Canvas camera={{ position: [0, 0, 5], zoom: 69 }} orthographic dpr={2}>
        <Suspense fallback={null}>
          <MyScene img={img} />

          <color attach="background" args={["#080406"]} />

          <axesHelper />
        </Suspense>
      </Canvas>
    </div>
  );
};
