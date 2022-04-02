import '@react-three/fiber'
import { forwardRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const bitmaskFromIndicesArray = (indices: number[]) => indices.reduce((acc, i) => acc | (1 << i), 0)

export const Layers = forwardRef<typeof THREE.Layers, { layers: number[] | number }>(
  ({ layers = [0] }, ref) => {
    const [layersObj] = useState(() => new THREE.Layers())

    useEffect(() => {
      layersObj.mask = bitmaskFromIndicesArray(typeof layers === 'number' ? [layers] : layers)
    }, [layers, layersObj])

    return <primitive ref={ref} object={layersObj} attach="layers" />
  }
)
