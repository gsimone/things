# React Three Fiber

## Layers

Simple helper for three's Layers, lets you set an object's layers in a declarative manner:

```js
<mesh>
  <Layers layers={[0, 1, 3]} /> {/* will set layers 0, 1 and 3 exclusively */}
</mesh>
```


# Leva

## BitMask

Plugin to add a bitmask-type input. Returns a bitmask object from [bitmaskjs](https://www.npmjs.com/package/bitmaskjs) with an additional `layersArray` property to get an array compatible with the [🔗 Layers r3f component](https://github.com/gsimone/things#layers)

```js
const { layers } = useControls({
  layers: bitmask({
    value: [1], // sets first bit to 1
    size: 16
  })  
})

useContro
```

**TODO**

Add alternative APIs to set the initial value.