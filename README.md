[![Node.js CI](https://github.com/gsimone/things/actions/workflows/node.js.yml/badge.svg)](https://github.com/gsimone/things/actions/workflows/node.js.yml)

# Three

## RaycasterHelper

[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/three-raycaster-helper)](https://bundlephobia.com/package/@gsimone/three-raycaster-helper)

```bash
yarn add @gsimone/three-raycaster-helper
```

![](https://github.com/gsimone/things/blob/feat/raycaster-helper/_images_/raycaster.png?raw=true)

Visualize a Raycaster (ray and near/far) and, optionally, its hits.

```js
import { RaycasterHelper } from '@gsimone/three-raycaster-helper'

const raycaster = new Raycaster(origin, direction, 0.5, 10)
const helper = new RaycasterHelper(raycaster)

const hits = raycaster.intersectObjects( scene.children )
helper.hits = hits
```

# React Three Fiber

## Layers

[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/r3f-layers)](https://bundlephobia.com/package/@gsimone/r3f-layers)

```bash
yarn add @gsimone/r3f-layers
```

Simple helper for three's Layers, lets you set an object's layers in a declarative manner:

```js
<mesh>
  <Layers layers={[0, 1, 3]} /> {/* will set layers 0, 1 and 3 exclusively */}
</mesh>
```

# Leva

## bitmask plugin

[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/leva-plugin-bitmask)](https://bundlephobia.com/package/@gsimone/leva-plugin-bitmask)

```bash
yarn add @gsimone/leva-plugin-bitmask
```

![](https://github.com/gsimone/things/blob/feat/raycaster-helper/_images_/leva-bitmask.png?raw=true)

Plugin to add a bitmask-type input. Returns a bitmask object from [bitmaskjs](https://www.npmjs.com/package/bitmaskjs) with an additional `layersArray` property to get an array compatible with the [🔗 Layers r3f component](https://github.com/gsimone/things#layers)

```js
const { layers } = useControls({
  layers: bitmask({
    value: [1, 0, 1], // sets first bit to 1, second to 0, third to 1
    size: 16,
  }),
  layers2: bitmask({
    value: 3, // sets the integer of the bitmask to 3, equivalent to [1, 1]
  }),
});

layers.layersArray; // [0]
```

**TODO**

Add alternative APIs to set the initial value.


# Vanilla

## Bitmask

[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/bitmask)](https://bundlephobia.com/package/@gsimone/bitmask)

```bash
yarn add @gsimone/bitmask
```

Tiny library for bitmasks.

```js
const bitmask = new Bitmask([1, 0, 1], 16);

bitmask.setBit(1, 1).clearBit(2).getBits();
```