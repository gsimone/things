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

import { Perf } from "r3f-perf";
import { MySprite } from "./components/Sprite";

extend({
  ClippedSpriteGeometry,
  ClippedFlipbookGeometry,
});

function MyScene({ img }) {
  const controls = useControls({
    alphaThreshold: { value: 0, min: 0, max: 1, step: 0.001 },
    horizontalSlices: { min: 1, max: 20, step: 1, value: 1 },
    verticalSlices: { min: 1, max: 20, step: 1, value: 1 },
    showPolygon: true,
  });

  const map = useTexture(img || "/assets/splos.png");

  return (
    <>
      <MyInstances map={map} vertices={8} {...controls} />
      {/* <MyFlipbook map={map} vertices={8} {...controls} /> */}
      {/* <MySprite map={map} position-x={-8} vertices={4} {...controls} /> */}
      {/* <MySprite map={map} {...controls} /> */}
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
          <axesHelper />
          <OrbitControls />

          <Perf position="bottom-right" />
        </Suspense>
      </Canvas>
    </div>
  );
};
