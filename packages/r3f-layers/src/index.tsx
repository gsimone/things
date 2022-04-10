import "@react-three/fiber";
import React, { forwardRef, useEffect, useState } from "react";
import { Layers as LayersThree } from "three";

const bitmaskFromIndicesArray = (indices: number[]) =>
  indices.reduce((acc, i) => acc | (1 << i), 0);

export const Layers = forwardRef<
  typeof LayersThree,
  { layers: number[] | number }
>(({ layers = [0] }, ref) => {
  const [layersObj] = useState(() => new LayersThree());

  useEffect(() => {
    layersObj.mask = bitmaskFromIndicesArray(
      typeof layers === "number" ? [layers] : layers
    );
  }, [layers, layersObj]);

  return <primitive ref={ref} object={layersObj} attach="layers" />;
});
