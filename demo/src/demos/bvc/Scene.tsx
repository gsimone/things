import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";

import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState, useTransition } from "react";
import { folder, useControls } from "leva";
import { extend } from "@react-three/fiber";

import { ClippedSpriteGeometry, ClippedFlipbookGeometry } from "@gsimone/bvc";
import "./materials";
import { MyFlipbook } from "./components/Flipbook";
import { MyInstances } from "./components/Instances";

import { Perf } from "r3f-perf";
import { MySprite } from "./components/Sprite";
import { Texture } from "three";

extend({
  ClippedSpriteGeometry,
  ClippedFlipbookGeometry,
});

function MyScene({ img }) {
  const controlsA = useControls({
    alphaThreshold: { value: 0, min: 0, max: 1, step: 0.001 },
   
    vertices: { min: 3, max: 12, value: 8, step: 1 },
    debug: folder({
      fps: { min: 12, max: 120, value: 30 },
      showPolygon: true,
    })
  });

  const controlsB = useControls({
    sprite: folder({
      horizontalSlices: { min: 1, max: 20, step: 1, value: 5 },
      verticalSlices: { min: 1, max: 20, step: 1, value: 5 },
    })
  })

  const controlsC = useControls(
    {
      sprite: folder({
        index: {
          min: 0,
          value: 1,
          max: controlsB.horizontalSlices * controlsB.verticalSlices - 1,
          step: 1,
        },
      }),
    },
    [controlsB.horizontalSlices, controlsB.verticalSlices]
  );

  const [transition, setTransition] = useTransition()
  const [vertices, setVertices] = useState(8)

  useEffect(() => {
    setTransition(() => {
      setVertices(controlsA.vertices)
    })
  }, [controlsA.vertices])
  
  const controls = {
    ...controlsA,
    ...controlsB,
    ...controlsC,
    vertices
  }

  const map = useTexture(img || "/assets/explosion.png") as Texture;

  return (
    <group >
      <group position-x={8} scale={5}>
        <MyInstances map={map} {...controls} />
      </group>
      <MyFlipbook map={map} {...controls} />
      <group position-x={-8}>
        <MySprite map={map} {...controls}  />
      </group>
    </group>
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
      <Canvas camera={{ position: [0, 0, 5], zoom: 65 }} orthographic dpr={2}>
        <Suspense fallback={null}>
          <MyScene img={img} />

          <color attach="background" args={["#666"]} />
          <OrbitControls />

          <Perf position="bottom-right" matrixUpdate />
        </Suspense>
      </Canvas>
    </div>
  );
};
