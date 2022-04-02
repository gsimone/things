# Vanilla

## Bitmask

```bash
yarn add @gsimone/bitmask
```

Tiny library for bitmasks.

```js
const bitmask = new Bitmask([1, 0, 1], 16)

bitmask
  .setBit(1, 1)
  .clearBit(2)
  .getBits()
```

# React Three Fiber

## Layers

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

```bash
yarn add @gsimone/leva-plugin-bitmask
```

Plugin to add a bitmask-type input. Returns a bitmask object from [bitmaskjs](https://www.npmjs.com/package/bitmaskjs) with an additional `layersArray` property to get an array compatible with the [🔗 Layers r3f component](https://github.com/gsimone/things#layers)

```js
const { layers } = useControls({
  layers: bitmask({
    value: [1, 0, 1], // sets first bit to 1, second to 0, third to 1
    size: 16
  }),
  layers2: bitmask({
    value: 3, // sets the integer of the bitmask to 3, equivalent to [1, 1]
  })  
})

layers.layersArray // [0]
```

**TODO**

Add alternative APIs to set the initial value.