[![NPM](https://badgen.net/npm/v/@gsimone/things)](https://www.npmjs.com/@gsimone/things) [![Node.js CI](https://github.com/gsimone/things/actions/workflows/node.js.yml/badge.svg)](https://github.com/gsimone/things/actions/workflows/node.js.yml)

👉 You can install the packages individually or just grab the kitchensink version with everything - and leave it to treeshaking to remove unused code.

```bash
npm i @gsimone/things
```

```js
import { CatenaryCurve, RaycasterHelper } from "@gsimone/things";
```

# Three

## RaycasterHelper

[![NPM](https://badgen.net/npm/v/@gsimone/three-raycaster-helper)](https://www.npmjs.com/@gsimone/three-raycaster-helper) [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/three-raycaster-helper)](https://bundlephobia.com/package/@gsimone/three-raycaster-helper)



```bash
npm i @gsimone/three-raycaster-helper
```

![](https://github.com/gsimone/things/blob/main/_images_/raycaster.png?raw=true)

Visualize a Raycaster (ray and near/far) and, optionally, its hits.

```js
import { RaycasterHelper } from "@gsimone/three-raycaster-helper";

const raycaster = new Raycaster(origin, direction, 0.5, 10);
const helper = new RaycasterHelper(raycaster);

const hits = raycaster.intersectObjects(scene.children);
helper.hits = hits;
```

## Catenary Curve


[![NPM](https://badgen.net/npm/v/@gsimone/three-catenary)](https://www.npmjs.com/@gsimone/three-catenary) [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/three-catenary)](https://bundlephobia.com/package/@gsimone/three-catenary)

```bash
npm i @gsimone/three-catenary
```

![](https://github.com/gsimone/things/blob/main/_images_/catenary.gif?raw=true)

An hyperbole that passes through 2 points, used as a good enough approximation of ropes collapsing under their own weight between two points.

```js
import { CatenaryCurve } from "@gsimone/three-catenary";

const catenary = new CatenaryCurve(p1, p2, 10);
const myGeometry = new TubeGeometry(catenary, 100, 0.1, 20, false);
```

@todo add credits & tiny explaination

## Smoothdamp

[![NPM](https://badgen.net/npm/v/@gsimone/smoothdamp)](https://www.npmjs.com/@gsimone/smoothdamp) [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/smoothdamp)](https://bundlephobia.com/package/@gsimone/smoothdamp)

```bash
npm i @gsimone/smoothdamp
```

Port of Unity's SmoothDamp.

```js
import { SmoothDamp } from "@gsimone/smoothdamp";
import { SmoothDampVectors } from "@gsimone/smoothdamp/three";

const smoothDamp = new SmoothDamp(0.5, 10);
const x = smoothDamp.get(10, deltaTime);

// using with three.js Vectors
const mySmoothDampV = new SmoothDampVectors(0.5, 10);
const target = new Vector3(0, 0, 0);
const dest = new Vector3(10, 0, 0);

target.copy(mySmoothDampV.get(target, dest, deltaTime));
```

# React Three Fiber

## Layers


[![NPM](https://badgen.net/npm/v/@gsimone/r3f-layers)](https://www.npmjs.com/@gsimone/r3f-layers) [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/r3f-layers)](https://bundlephobia.com/package/@gsimone/r3f-layers)

```bash
npm i @gsimone/r3f-layers
```

Simple helper for three's Layers, lets you set an object's layers in a declarative manner:

```js
<mesh>
  <Layers layers={[0, 1, 3]} /> {/* will set layers 0, 1 and 3 exclusively */}
</mesh>
```

# Leva

## bitmask plugin

[![NPM](https://badgen.net/npm/v/@gsimone/leva-plugin-bitmask)](https://www.npmjs.com/@gsimone/leva-plugin-bitmask) [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/leva-plugin-bitmask)](https://bundlephobia.com/package/@gsimone/leva-plugin-bitmask)

```bash
npm i @gsimone/leva-plugin-bitmask
```

![](https://github.com/gsimone/things/blob/main/_images_/leva-bitmask.png?raw=true)

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

[![NPM](https://badgen.net/npm/v/@gsimone/bitmask)](https://www.npmjs.com/@gsimone/bitmask) 
[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gsimone/bitmask)](https://bundlephobia.com/package/@gsimone/bitmask)

```bash
npm i @gsimone/bitmask
```

Tiny library for bitmasks.

```js
const bitmask = new Bitmask([1, 0, 1], 16);

bitmask.setBit(1, 1).clearBit(2).getBits();
```
